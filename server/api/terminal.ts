import type { FastifyInstance, FastifyRequest } from 'fastify';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

interface TerminalSession {
  process: ChildProcessWithoutNullStreams;
  sessionId: string;
}

interface TerminalQuery {
    token?: string;
}

const sessions = new Map<string, TerminalSession & { lastActivity: number, inputBuffer: string }>();

// Cleanup inactive sessions every minute
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > timeout) {
      try {
        session.process.removeAllListeners();
        session.process.kill('SIGTERM');
        setTimeout(() => {
            if (!session.process.killed) session.process.kill('SIGKILL');
        }, 5000);
        sessions.delete(id);
        console.log(`[Terminal] Session ${id} cleaned up after timeout`);
      } catch (e) {
        console.error(`[Terminal] Cleanup error for ${id}:`, e);
      }
    }
  }
}, 60000);

export default async function (fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection: any, req: FastifyRequest) => {
    const socket = connection.socket;
    
    // Auth Check for WebSocket - use req.query which is pre-parsed by Fastify
    const query = req.query as TerminalQuery;
    const token = query?.token;
    
    // Only log first 8 chars
    const safeToken = token ? `${token.substring(0, 8)}...` : 'none';
    // Security: Do NOT log req.url as it contains the full token query param
    const safeUrl = req.url.split('?')[0];
    console.log(`[Terminal] WS Connection attempt. URL: ${safeUrl}, Token: ${safeToken}`);

    if (!token) {
      console.error('[Terminal] WS Auth Failed: No token in query');
      socket.close(1008, 'Unauthorized: Missing token');
      return;
    }

    try {
      const sessionRow = db.prepare('SELECT id FROM auth_session WHERE id = ?').get(token);
      if (!sessionRow) {
        console.error(`[Terminal] WS Auth Failed: Invalid token "${safeToken}"`);
        socket.close(1008, 'Unauthorized: Invalid token');
        return;
      }
    } catch (err) {
      console.error('[Terminal] Database error during auth:', err);
      socket.close(1011, 'Internal Server Error');
      return;
    }

    console.log('[Terminal] WS Connection authenticated successfully');

    let sessionId: string | null = null;
    let messageCount = 0;
    let lastMessageTime = Date.now();

    socket.on('message', async (message: Buffer) => {
      // Rate limiting: max 100 messages per second
      const now = Date.now();
      if (now - lastMessageTime > 1000) {
          messageCount = 0;
          lastMessageTime = now;
      }
      messageCount++;
      if (messageCount > 100) {
          console.warn(`[Terminal] Rate limit exceeded for ${sessionId}`);
          return; 
      }

      try {
        const payload = JSON.parse(message.toString());

        if (payload.type === 'init') {
          // Use the auth token as the base for the terminal session if no specific one provided
          sessionId = payload.sessionId || `term-${uuidv4().substring(0, 8)}`;
          
          if (sessions.has(sessionId!)) {
            const existing = sessions.get(sessionId!)!;
            existing.lastActivity = Date.now();
            
            socket.send(JSON.stringify({ type: 'ready', sessionId }));

            const onData = (data: Buffer) => {
              if (socket.readyState === 1) { 
                socket.send(JSON.stringify({
                  type: 'output',
                  sessionId,
                  data: data.toString()
                }));
              }
            };

            existing.process.stdout.on('data', onData);
            existing.process.stderr.on('data', onData);

            socket.on('close', () => {
              existing.process.stdout.off('data', onData);
              existing.process.stderr.off('data', onData);
            });
            return;
          }

          const shell = process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');
          const args = shell.includes('bash') || shell.includes('sh') ? ['-i'] : [];
          
          let cwd = process.cwd();
          if (payload.workspaceId) {
            const path = await import('path');
            const workspacePath = path.default.join(process.cwd(), 'workspace', payload.workspaceId);
             try {
                // Ensure it exists
                const fs = await import('fs');
                if (fs.existsSync(workspacePath)) {
                  cwd = workspacePath;
                }
             } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
                 console.warn('[Terminal] Invalid workspace path, falling back to CWD');
             }
          }

          let terminal: ChildProcessWithoutNullStreams;
          try {
            terminal = spawn(shell, args, {
              env: { ...process.env, TERM: 'xterm-256color' },
              cwd: cwd,
            });
          } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            socket.send(JSON.stringify({
              type: 'output',
              sessionId,
              data: `\r\n\x1b[31mFailed to spawn shell: ${err.message}\x1b[0m\r\n`
            }));
            return;
          }

          sessions.set(sessionId!, {
            process: terminal,
            sessionId: sessionId!,
            lastActivity: Date.now(),
            inputBuffer: ''
          });

          socket.send(JSON.stringify({ type: 'ready', sessionId }));

          const sendOutput = (data: Buffer) => {
            if (socket.readyState === 1) {
              socket.send(JSON.stringify({
                type: 'output',
                sessionId,
                data: data.toString()
              }));
            }
          };

          terminal.stdout.on('data', sendOutput);
          terminal.stderr.on('data', sendOutput);

          terminal.on('exit', (code) => {
            if (socket.readyState === 1) {
              socket.send(JSON.stringify({ type: 'exit', sessionId, code }));
            }
            sessions.delete(sessionId!);
          });

        } else if (payload.type === 'input') {
          const session = sessions.get(payload.sessionId);
          if (session) {
            session.lastActivity = Date.now();
            const input = payload.data;

            session.process.stdin.write(input);

            if (input === '\x03') { session.process.kill('SIGINT'); }
            else if (input === '\x1a') { session.process.kill('SIGTSTP'); }
            else if (input === '\x1c') { session.process.kill('SIGQUIT'); }

            if (input === '\r' || input === '\n') {
              const cmd = session.inputBuffer.trim().toLowerCase();
              if (cmd === 'exit' || cmd === 'logout') {
                socket.close();
              }
              session.inputBuffer = '';
            } else if (input === '\u007f') {
              session.inputBuffer = session.inputBuffer.slice(0, -1);
            } else {
              session.inputBuffer += input;
            }
          }
        }
      } catch (e) {
        console.error('[Terminal] WS Message processing error:', e);
      }
    });

    socket.on('error', (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('[Terminal] Socket error:', err);
    });

    socket.on('close', () => {
      console.log('[Terminal] WS Connection closed');
    });
  });
}