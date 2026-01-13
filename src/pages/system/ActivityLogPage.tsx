import React, { useEffect, useState } from 'react';
import { Activity, Clock, User, LogIn, FileText, AlertCircle, Terminal, Search, Trash2, X } from 'lucide-react';
import { authFetch } from '../../app/authFetch';
import { useTitle } from '../../hooks/useTitle';
import { useToast } from '../../app/ToastContext';

interface LogEntry {
  id: number;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  category?: string;
  user?: string;
  metadata?: any;
}

const ActivityLogPage: React.FC = () => {
  useTitle('Activity Logs');
  const { error } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter) params.append('level', levelFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('limit', '100');

      const res = await authFetch(`/api/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, levelFilter, categoryFilter]);

  const handleClearLogs = async () => {
      if (!confirm('Are you sure you want to clear all activity logs?')) return;
      try {
          await authFetch('/api/logs', { method: 'DELETE' });
          fetchLogs();
      } catch (e) {
          error('Failed to clear logs');
      }
  };

  const getIcon = (category?: string) => {
      switch(category) {
          case 'auth': return <LogIn size={16} color="#60a5fa" />;
          case 'access': return <FileText size={16} color="#34d399" />;
          case 'system': return <Terminal size={16} color="#fbbf24" />;
          case 'error': return <AlertCircle size={16} color="#ef4444" />;
          default: return <Activity size={16} color="#9ca3af" />;
      }
  };

  const formatDate = (ts: number) => {
      return new Intl.DateTimeFormat('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(new Date(ts));
  };

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity size={28} color="var(--accent-primary)" /> Activity Logs
        </h1>
        <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary" onClick={() => fetchLogs()} title="Refresh">Refresh</button>
            <button className="btn-primary" onClick={handleClearLogs} style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} title="Clear Logs">
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24, padding: '16px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                    width: '100%', padding: '8px 12px 8px 36px', 
                    borderRadius: '6px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'
                }}
              />
              {search && (
                  <X 
                    size={14} 
                    style={{ position: 'absolute', right: 12, top: 11, cursor: 'pointer', color: 'var(--text-secondary)' }} 
                    onClick={() => setSearch('')}
                  />
              )}
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                  <option value="">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
              </select>

              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                  <option value="">All Categories</option>
                  <option value="auth">Auth</option>
                  <option value="access">Access</option>
                  <option value="system">System</option>
              </select>
          </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading activity...</div>
          ) : logs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No matching activity found.</div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {logs.map((log) => (
                      <div 
                        key={log.id} 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '16px 20px', 
                            borderBottom: '1px solid var(--border-color)',
                            gap: '16px',
                            backgroundColor: log.level === 'error' ? 'rgba(239, 68, 68, 0.05)' : undefined
                        }}
                      >
                          <div style={{ 
                              width: 36, height: 36, borderRadius: '50%', 
                              backgroundColor: 'var(--bg-tertiary)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                          }}>
                              {getIcon(log.category)}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--text-primary)' }}>{log.message}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Clock size={12} /> {formatDate(log.timestamp)}
                                  </span>
                                  {log.user && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                          <User size={12} /> {log.user}
                                      </span>
                                  )}
                                  {log.category && (
                                      <span style={{ 
                                          padding: '2px 6px', borderRadius: '4px', 
                                          backgroundColor: 'var(--bg-tertiary)', fontSize: '10px',
                                          textTransform: 'uppercase', letterSpacing: '0.5px'
                                      }}>
                                          {log.category}
                                      </span>
                                  )}
                              </div>
                          </div>

                          {log.level === 'warn' && <AlertCircle size={16} color="#fbbf24" />}
                          {log.level === 'error' && <AlertCircle size={16} color="#ef4444" />}
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
