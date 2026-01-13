import React, { useState } from 'react';
import { Server, Folder, File, ArrowLeft, RefreshCw, Upload } from 'lucide-react';
import { pluginFetch } from '../authHelper';
import { useToast } from '../../app/ToastContext';

interface FtpItem {
  name: string;
  type: 'file' | 'folder';
  size: number;
  modifiedAt: string;
}

const FtpClientApp = () => {
  const { error, success } = useToast();
  
  // Connection Details
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(2121);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(false);
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState<FtpItem[]>([]);

  const connect = async () => {
    setLoading(true);
    await fetchList('/');
    setLoading(false);
  };

  const fetchList = async (path: string) => {
    try {
      const res = await pluginFetch('/api/ftp-client/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password, secure, path })
      });
      
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setCurrentPath(path);
        setConnected(true);
      } else {
        const err = await res.json();
        error(err.message || 'Connection failed');
      }
    } catch (e) {
      error('Network error');
    }
  };

  const handleItemClick = (item: FtpItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setLoading(true);
      fetchList(newPath).finally(() => setLoading(false));
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    setLoading(true);
    fetchList(newPath).finally(() => setLoading(false));
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const formData = new FormData();
      // Fields first
      formData.append('host', host);
      formData.append('port', port.toString());
      formData.append('user', user);
      formData.append('password', password);
      formData.append('secure', String(secure));
      formData.append('remoteDir', currentPath);
      // File last
      formData.append('file', file);
      
      setLoading(true);
      try {
          // Note: pluginFetch wrapper might set content-type json by default if not careful, 
          // but here we are sending FormData, so browser sets multipart/form-data.
          // However, our pluginFetch helper adds Authorization headers.
          
          const res = await pluginFetch('/api/ftp-client/upload', {
              method: 'POST',
              body: formData,
              headers: {} // Let browser set Content-Type
          });
          
          if (res.ok) {
              success('Uploaded successfully');
              fetchList(currentPath);
          } else {
              error('Upload failed');
          }
      } catch {
          error('Upload failed');
      } finally {
          setLoading(false);
      }
  };

  if (!connected) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Server size={24} color="#10b981" />
          <h2 style={{ margin: 0 }}>Connect to FTP</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Host</label>
            <input 
              style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              value={host} onChange={e => setHost(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Port</label>
                <input 
                  type="number"
                  style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  value={port} onChange={e => setPort(Number(e.target.value))} 
                />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" checked={secure} onChange={e => setSecure(e.target.checked)} />
                    Secure (FTPS)
                </label>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Username</label>
            <input 
              style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              value={user} onChange={e => setUser(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Password</label>
            <input 
              type="password"
              style={{ width: '100%', padding: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button 
            onClick={connect} 
            disabled={loading}
            style={{ 
                marginTop: 10, padding: 10, background: 'var(--accent-primary)', color: 'white', 
                border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 
            }}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-primary)' }}>
       <div style={{ padding: 10, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)' }}>
           <button onClick={handleUp} disabled={currentPath === '/'} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
               <ArrowLeft size={18} />
           </button>
           <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}>{currentPath}</div>
           
           <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 4 }}>
               <Upload size={14} /> Upload
               <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
           </label>
           
           <button onClick={() => fetchList(currentPath)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
               <RefreshCw size={18} />
           </button>
       </div>
       
       <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
           {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div> : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                   {items.map((item, i) => (
                       <div 
                           key={i} 
                           onClick={() => handleItemClick(item)}
                           style={{ 
                               display: 'flex', flexDirection: 'column', alignItems: 'center', 
                               padding: 10, borderRadius: 6, cursor: 'pointer',
                               border: '1px solid transparent',
                               textAlign: 'center'
                           }}
                           onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                           onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                       >
                           <div style={{ marginBottom: 6 }}>
                               {item.type === 'folder' 
                                   ? <Folder size={40} color="#fbbf24" fill="#fbbf24" fillOpacity={0.2} /> 
                                   : <File size={40} color="#94a3b8" />
                               }
                           </div>
                           <div style={{ fontSize: 12, wordBreak: 'break-word', width: '100%' }}>
                               {item.name}
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};

export default FtpClientApp;
