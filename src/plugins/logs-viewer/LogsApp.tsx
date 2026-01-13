import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { getSessionToken } from '../authHelper';
import './LogsApp.css';

const LogsApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0f0f0f',
        foreground: '#cccccc',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    xtermRef.current = term;

    term.open(terminalRef.current);
    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    // Connect to WS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = getSessionToken();
    const wsUrl = `${protocol}//${window.location.host}/api/logs/ws?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setStatus('connected');
      term.writeln('\x1b[1;32m--- Connected to Server Logs ---\x1b[0m');
    };

    socket.onmessage = (event) => {
        // Log messages from pino-pretty contain ANSI codes, so xterm handles them well
        term.write(event.data);
    };

    socket.onclose = () => {
      setStatus('disconnected');
      term.writeln('\x1b[1;31m--- Disconnected ---\x1b[0m');
    };

    return () => {
      socket.close();
      term.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="logs-container">
      <div className="logs-header">
        <div className="status-indicator">
            <div className={`status-dot ${status}`} />
            <span>{status === 'connected' ? 'Live Server Logs' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="terminal-wrapper" ref={terminalRef} />
    </div>
  );
};

export default LogsApp;
