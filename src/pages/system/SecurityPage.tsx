import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, AlertCircle } from 'lucide-react';
import { authFetch } from '../../app/authFetch';
import { useTitle } from '../../hooks/useTitle';
import { useToast } from '../../app/ToastContext';

const SecurityPage: React.FC = () => {
  useTitle('Security');
  const { success, error, warning } = useToast();
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
        warning('Password must be at least 8 characters');
        return;
    }

    setPasswordLoading(true);
    try {
        const res = await authFetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });

        if (res.ok) {
            success('Password updated successfully. Please ensure you remove the environment variable override to prevent unauthorized access.');
            setNewPassword('');
        } else {
            const err = await res.json();
            error(err.error || 'Failed to update password');
        }
    } catch (e) {
        console.error('Change password error:', e);
        error('Failed to change password');
    } finally {
        setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="var(--accent-primary)" /> Security
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        
        {/* Change Password */}
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={20} /> Change Root Password
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>New Root Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{ width: '100%' }}
              />
            </div>
            <button 
                className="btn-primary" 
                onClick={handleChangePassword} 
                disabled={passwordLoading}
                style={{ width: 'fit-content' }}
            >
                {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>

            <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                backgroundColor: '#f59e0b15', 
                borderRadius: '8px', 
                border: '1px solid #f59e0b33',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
            }}>
                <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#d97706', lineHeight: '1.5' }}>
                    <b>Security Notice:</b> After resetting your password, ensure you remove the <code>KERNEX_ROOT_OVERRIDE</code> environment variable from your host environment to prevent future credential bypass.
                </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1px solid #ff444433' }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#ff4444', fontSize: 16 }}>
            <AlertTriangle size={18} /> Danger Zone
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Immediately terminates all running workers and clears the execution cache.</div>
            <button 
              className="btn-primary" 
              style={{ backgroundColor: '#ff4444', fontSize: 12 }}
              onClick={() => confirm('Are you sure you want to restart the runtime?')}
            >
              Restart Runtime
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default SecurityPage;