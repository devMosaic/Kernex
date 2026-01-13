import pino from 'pino';
import { EventEmitter } from 'events';

export const logEmitter = new EventEmitter();

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    messageFormat: '{levelLabel}: {msg}',
    customLevels: 'trace:10,debug:20,info:30,warn:40,error:50,fatal:60',
    useOnlyCustomLevels: false,
    colorize: true
  }
});

// Hook into the write method of the transport to broadcast
const originalWrite = transport.write.bind(transport);
transport.write = (chunk: any) => {
    // Determine level if possible, or just send raw text
    // Chunk from pino-pretty is already formatted string with colors
    logEmitter.emit('log', chunk.toString());
    return originalWrite(chunk);
};

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  customLevels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  }
}, transport);

