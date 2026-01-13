import { Server } from 'lucide-react';

const FtpUsage = () => {
  return (
    <div style={{ padding: 20, color: 'var(--text-primary)', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
        <Server size={24} color="#10b981" />
        <h2 style={{ margin: 0, fontSize: 18 }}>FTP Connection Info</h2>
      </div>

      <p style={{ lineHeight: 1.6, marginBottom: 20 }}>
        You can upload and manage files in this workspace using any standard FTP client (like FileZilla, Cyberduck, or WinSCP).
      </p>

      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, fontSize: 14, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Server Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, fontSize: 14 }}>
            <div style={{ color: 'var(--text-secondary)' }}>Host:</div>
            <div style={{ fontFamily: 'monospace' }}>localhost (or server IP)</div>
            
            <div style={{ color: 'var(--text-secondary)' }}>Port:</div>
            <div style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>2121</div>
            
            <div style={{ color: 'var(--text-secondary)' }}>Protocol:</div>
            <div>FTP (Passive Mode)</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
         <h3 style={{ fontSize: 14 }}>Credentials</h3>
         <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
             Manage FTP users and passwords in the <b>Settings &gt; FTP Server</b> tab.
         </p>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
         <b>Note:</b> Files uploaded via FTP will appear in the specific root directory assigned to the user (e.g., <code>workspace/uploads</code>).
      </div>
    </div>
  );
};

export default FtpUsage;
