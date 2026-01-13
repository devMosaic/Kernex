declare module 'ftp-srv' {
  import { Connection, FileSystem } from 'ftp-srv';
  import { Readable, Writable } from 'stream';
  import * as net from 'net';

  export interface FtpSrvOptions {
    url?: string;
    pasv_url?: string;
    pasv_min?: number;
    pasv_max?: number;
    greeting?: string | string[];
    tls?: any;
    anonymous?: boolean;
    file_format?: string;
    blacklist?: string[];
    whitelist?: string[];
  }

  export class FtpSrv {
    constructor(options?: FtpSrvOptions);
    listen(): Promise<void>;
    close(): Promise<void>;
    on(event: 'login', listener: (data: { connection: any, username: string, password: string }, resolve: (data: any) => void, reject: (err: Error) => void) => void): this;
    on(event: 'client-error', listener: (data: { connection: any, context: string, error: Error }) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  
  export class FileSystem {
     constructor(connection: any, { root, cwd }: { root: string, cwd: string });
     root: string;
     cwd: string;
     get(fileName: string): Promise<any>;
     list(path: string): Promise<any[]>;
     chdir(path: string): Promise<string>;
     write(fileName: string, options?: any): Promise<Writable>;
     read(fileName: string, options?: any): Promise<Readable>;
     delete(fileName: string): Promise<any>;
     mkdir(path: string): Promise<any>;
     rename(from: string, to: string): Promise<any>;
     chmod(path: string, mode: string): Promise<any>;
  }
}
