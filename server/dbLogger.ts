import db from './db.js';

type LogLevel = 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'access' | 'system' | 'error';

export function logActivity(
    level: LogLevel,
    message: string,
    category: LogCategory = 'system',
    user: string = 'system',
    metadata?: object
) {
    try {
        const stmt = db.prepare(
            'INSERT INTO logs (timestamp, level, message, category, user, metadata) VALUES (?, ?, ?, ?, ?, ?)'
        );
        stmt.run(
            Date.now(),
            level,
            message,
            category,
            user,
            metadata ? JSON.stringify(metadata) : null
        );
    } catch (e) {
        console.error('Failed to write to activity log:', e);
    }
}
