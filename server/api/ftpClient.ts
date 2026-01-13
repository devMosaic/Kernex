import type { FastifyInstance } from 'fastify';
import { Client } from 'basic-ftp';
import path from 'path';

export default async function (fastify: FastifyInstance) {
  // GET /api/ftp-client/list
  // Params: host, port, user, password, path
  fastify.post('/list', async (request, reply) => {
    const { host, port, user, password, secure, path: remotePath } = request.body as any;
    
    const client = new Client();
    client.ftp.verbose = false;

    try {
      await client.access({
        host,
        port: port || 21,
        user,
        password,
        secure: secure === true
      });

      const list = await client.list(remotePath || '/');
      client.close();

      return list.map(item => ({
        name: item.name,
        // basic-ftp: type 2 is directory.
        type: (item.type === 2 || item.isDirectory) ? 'folder' : 'file',
        size: item.size,
        modifiedAt: item.modifiedAt,
        raw: item
      }));
    } catch (err: any) {
      client.close();
      return reply.code(500).send({ message: err.message });
    }
  });

  // POST /api/ftp-client/download
  fastify.post('/download', async (request, reply) => {
    const { host, port, user, password, secure, remotePath } = request.body as any;
    const client = new Client();

    try {
      await client.access({
        host,
        port: port || 21,
        user,
        password,
        secure: secure === true
      });

      const fileName = path.basename(remotePath);
      // We can't stream directly easily with basic-ftp to reply without a temp file or pass-through
      // But reply.send(stream) works if we can get a readable stream.
      // basic-ftp doesn't expose a simple "getStream" easily, it likes downloadTo.
      // Wait, client.downloadTo(writableStream) works.

      const passThrough = new (await import('stream')).PassThrough();
      
      reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // We need to ensure we don't close client before stream ends.
      client.downloadTo(passThrough, remotePath).then(() => {
          client.close();
      }).catch(err => {
          console.error('FTP Download Error:', err);
          client.close();
      });

      return reply.send(passThrough);
    } catch (err: any) {
      client.close();
      return reply.code(500).send({ message: err.message });
    }
  });

  // POST /api/ftp-client/upload
  fastify.post('/upload', async (request, reply) => {
    try {
        const parts = request.parts();
        const fields: any = {};
        
        // Iterate parts. Expect fields first, then file.
        for await (const part of parts) {
            if (part.type === 'file') {
                // When we hit the file, we must have fields ready to connect
                const { host, port, user, password, secure, remoteDir } = fields;
                
                if (!host) {
                    // Consuming stream to avoid hanging if we error out? 
                    // Or just throwing is enough, busboy handles cleanup usually.
                    return reply.code(400).send({ message: 'Missing host or fields sent after file' });
                }

                const client = new Client();
                client.ftp.verbose = false;
                
                try {
                    await client.access({
                        host,
                        port: parseInt(port) || 21,
                        user,
                        password,
                        secure: secure === 'true'
                    });

                    const fileName = part.filename;
                    const remotePath = path.posix.join(remoteDir || '/', fileName);
                    
                    // Stream directly to FTP
                    await client.uploadFrom(part.file, remotePath);
                } finally {
                    client.close();
                }
                
                // We processed the file. We can stop or continue? 
                // Usually file is last.
                return { success: true };
            } else {
                fields[part.fieldname] = part.value;
            }
        }

        return reply.code(400).send({ message: 'No file found in request' });
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
  });
}
