import { FtpSrv } from 'ftp-srv';
import db, { getSetting } from './db.js';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { logEmitter } from './logEmitter.js';

const FTP_PORT = 2121;
const WORKSPACE_ROOT = path.join(process.cwd(), 'workspace');

export class FtpServerManager {
  private ftpServer: FtpSrv | null = null;

  constructor() {
    const externalIp =
      getSetting<string>('ftpExternalIp', '') || '127.0.0.1';

    this.ftpServer = new FtpSrv({
      url: `ftp://0.0.0.0:${FTP_PORT}`,
      pasv_min: 30000,
      pasv_max: 30100,
      pasv_url: externalIp,
      greeting: 'Welcome to Kernex FTP',
      anonymous: false // Disable anonymous login
    });

    this.setupAuth();
  }

  private setupAuth() {
    if (!this.ftpServer) return;

    this.ftpServer.on('login', async ({ connection: _connection, username, password }, resolve, reject) => {
      try {
        const row = db.prepare('SELECT * FROM ftp_accounts WHERE username = ?').get(username) as any;

        if (!row) {
          return reject(new Error('Invalid username or password'));
        }

        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) {
          return reject(new Error('Invalid username or password'));
        }

        // Determine user's root directory
        // Security: Ensure it's within WORKSPACE_ROOT
        let userRoot = path.join(WORKSPACE_ROOT, row.root_dir.replace(/^\//, ''));

        // Prevent traversal above WORKSPACE_ROOT
        if (!userRoot.startsWith(WORKSPACE_ROOT)) {
          userRoot = WORKSPACE_ROOT;
        }

        // Ensure directory exists
        await fs.mkdir(userRoot, { recursive: true });

        logEmitter.emit('log', `FTP Login: ${username}`);

        resolve({
          root: userRoot,
          cwd: '/', // Initial current working directory
          blacklist: ['node_modules', '.git'], // Prevent access to sensitive folders
        });

      } catch (err) {
        console.error('FTP Auth Error:', err);
        reject(err as Error);
      }
    });

    this.ftpServer.on('client-error', ({ connection: _connection, context: _context, error }) => {
      console.error('FTP Client Error:', error);
    });
  }

  public async start() {
    if (!this.ftpServer) return;
    try {
      await this.ftpServer.listen();
      console.log(`FTP Server running on ftp://0.0.0.0:${FTP_PORT}`);
    } catch (err) {
      console.error('Failed to start FTP server:', err);
    }
  }

  public close() {
    if (this.ftpServer) {
      this.ftpServer.close();
    }
  }
}

export const ftpManager = new FtpServerManager();
