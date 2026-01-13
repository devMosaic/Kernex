import type { FastifyInstance } from 'fastify';
import db from '../db.js';

export default async function logRoutes(fastify: FastifyInstance) {
  
  // Get logs
  fastify.get('/', async (request, reply) => {
    const { limit = 100, level, category, search } = request.query as { limit?: number, level?: string, category?: string, search?: string };
    
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (message LIKE ? OR user LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    try {
      const logs = db.prepare(query).all(...params);
      return logs.map((log: any) => ({
          ...log,
          metadata: log.metadata ? JSON.parse(log.metadata) : undefined
      }));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to fetch logs' });
    }
  });

  // Clear logs
  fastify.delete('/', async (request, reply) => {
      try {
          db.prepare('DELETE FROM logs').run();
          return { success: true };
      } catch (err) {
          request.log.error(err);
          return reply.status(500).send({ error: 'Failed to clear logs' });
      }
  });
}