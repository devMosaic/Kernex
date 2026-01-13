import React, { useState, useEffect } from 'react';
import { Trash2, User, Folder, RefreshCw, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { authFetch } from '../../app/authFetch';
import { useToast } from '../../app/ToastContext';
import { Link } from 'react-router-dom';

interface FtpAccount {
  id: number;
  username: string;
  root_dir: string;
  readonly: number;
  created_at: number;
}

const FtpSettings: React.FC = () => {
  const { success, error } = useToast();
  const [accounts, setAccounts] = useState<FtpAccount[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rootDir, setRootDir] = useState('/');
  const [showPassword, setShowPassword] = useState(false);
  const [externalIp, setExternalIp] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/ftp/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        error('Failed to fetch accounts');
      }
      
      // Fetch settings
      const settingsRes = await authFetch('/api/settings');
      if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setExternalIp(settings.ftpExternalIp || '');
      }

    } catch (e) {
      error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUpdateIp = async () => {
      try {
          await authFetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ftpExternalIp: externalIp })
          });
          success('FTP configuration updated');
      } catch {
          error('Failed to update configuration');
      }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const res = await authFetch('/api/ftp/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, root_dir: rootDir })
      });

      if (res.ok) {
        success('Account created');
        setUsername('');
        setPassword('');
        setRootDir('/');
        fetchAccounts();
      } else {
        const err = await res.json();
        error(err.message || 'Failed to create account');
      }
    } catch (e) {
      error('Failed to create account');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FTP account?')) return;
    try {
      const res = await authFetch(`/api/ftp/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Account deleted');
        setAccounts(accounts.filter(a => a.id !== id));
      } else {
        error('Failed to delete');
      }
    } catch (e) {
      error('Network error');
    }
  };

  return (
    <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>FTP Server Accounts</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Manage users who can access the workspace via FTP (Port 2121).
                </p>
            </div>
            <Link to="/docs/FTP" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>
                <HelpCircle size={16} /> Documentation
            </Link>
        </div>
        
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: 14, marginTop: 0, marginBottom: 12 }}>Server Configuration</h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>External IP Address (PASV)</label>
                    <input 
                        type="text" 
                        value={externalIp} 
                        onChange={e => setExternalIp(e.target.value)} 
                        placeholder="e.g. 203.0.113.1 (Leave empty for localhost)"
                        style={{ width: '100%' }}
                    />
                </div>
                <button onClick={handleUpdateIp} className="btn-primary">Update Config</button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Required for external access. Passive ports: <b>30000-30100</b>. Ensure these are open in your firewall.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
                <h4 style={{ fontSize: 14, marginBottom: 12 }}>Create Account</h4>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            placeholder="username"
                            required 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="password"
                                required 
                                style={{ width: '100%' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', 
                                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' 
                                }}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Root Directory</label>
                        <input 
                            type="text" 
                            value={rootDir} 
                            onChange={e => setRootDir(e.target.value)} 
                            placeholder="/uploads"
                            style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Relative to workspace root
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
                        Create User
                    </button>
                </form>
            </div>

            <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 14, margin: 0 }}>Active Users</h4>
                    <button onClick={fetchAccounts} className="icon-btn" title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                 </div>
                 
                 <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden', minHeight: 150 }}>
                    {loading && <div style={{ padding: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Loading...</div>}
                    {!loading && accounts.length === 0 && (
                        <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                            No active accounts
                        </div>
                    )}
                    {accounts.map(acc => (
                        <div key={acc.id} style={{ 
                            padding: '10px 12px', 
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 13
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <User size={12} color="var(--accent-primary)" /> {acc.username}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Folder size={10} /> {acc.root_dir}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(acc.id)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default FtpSettings;
