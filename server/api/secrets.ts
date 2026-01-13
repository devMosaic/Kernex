import type { FastifyInstance } from 'fastify';
import db from '../db.js';
import { encryptSecret } from '../crypto.js';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (_request, _reply) => {
    try {
      const rows = db.prepare('SELECT key FROM secrets').all() as { key: string }[];
      return rows.map(r => ({ key: r.key }));
    } catch (e) {
      console.error('DB Error fetching secrets:', e);
      return [];
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const { key, value } = request.body as { key: string, value: string };
      const encryptedValue = encryptSecret(value);
      db.prepare('INSERT OR REPLACE INTO secrets (key, value) VALUES (?, ?)').run(key, encryptedValue);
      return { success: true };
    } catch (e) {
      console.error('DB Error saving secret:', e);
      reply.status(500).send({ error: 'Failed to save secret' });
    }
  });

  fastify.delete('/:key', async (request, reply) => {
    try {
      const { key } = request.params as { key: string };
      db.prepare('DELETE FROM secrets WHERE key = ?').run(key);
      return { success: true };
    } catch (e) {
      console.error('DB Error deleting secret:', e);
      reply.status(500).send({ error: 'Failed to delete secret' });
    }
  });
}
