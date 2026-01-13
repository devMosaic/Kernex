import React from 'react';

export interface UploadFile {
    id: string;
    name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface UploadProgressProps {
  files: UploadFile[];
  onClose: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ files, onClose }) => {
  if (files.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 320,
      backgroundColor: 'var(--bg-secondary, #1e1e1e)',
      border: '1px solid var(--border-color, #333)',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 10000,
      color: 'var(--text-primary, #fff)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '300px'
    }}>
      <div style={{ 
          padding: '12px', 
          borderBottom: '1px solid var(--border-color, #333)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-tertiary, #252525)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
      }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>File Uploads</h4>
        <button 
            onClick={onClose} 
            style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-secondary, #888)', 
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0 4px'
            }}
        >
            ×
        </button>
      </div>
      <div style={{ padding: '10px', overflowY: 'auto' }}>
        {files.map((f) => (
          <div key={f.id} style={{ marginBottom: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  maxWidth: '70%',
                  color: 'var(--text-primary, #eee)'
              }}>
                  {f.name}
              </span>
              <span style={{ 
                  color: f.status === 'completed' ? '#4caf50' : f.status === 'error' ? '#f44336' : 'var(--text-secondary, #888)',
                  fontSize: 12
              }}>
                  {f.status === 'completed' ? 'Done' : f.status === 'error' ? 'Failed' : `${Math.round(f.progress)}%`}
              </span>
            </div>
            <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-primary, #111)', borderRadius: 2 }}>
              <div style={{ 
                width: `${f.progress}%`, 
                height: '100%', 
                backgroundColor: f.status === 'completed' ? '#4caf50' : f.status === 'error' ? '#f44336' : '#2196f3',
                borderRadius: 2,
                transition: 'width 0.2s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;
