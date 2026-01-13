import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTitle } from '../hooks/useTitle';
import UnifiedSidebar, { type SidebarItem } from '../components/layout/UnifiedSidebar';
import { ArrowLeft, Save, Layout, Info } from 'lucide-react';
import { workspaceApi } from '../api/workspace';
import { authFetch } from '../app/authFetch';
import { useToast } from '../app/ToastContext';

const WorkspaceSettingsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  useTitle(`Settings - ${workspaceId}`);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch workspace details (reuse list for now, ideally get by id)
    workspaceApi.list().then(list => {
        const ws = list.find(w => w.id === workspaceId);
        if (ws) setName(ws.name);
    });
  }, [workspaceId]);

  const handleSave = async () => {
    if (!workspaceId || !name) return;
    setLoading(true);
    try {
        const res = await authFetch(`/api/workspaces/${workspaceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            success('Saved successfully');
        } else {
            error('Failed to save');
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
      { id: 'back', label: 'Back to Workspace', icon: <ArrowLeft size={20} />, action: () => navigate(`/workspace/${workspaceId}`) },
      { isDivider: true, groupLabel: 'Configuration' },
      { id: 'general', label: 'General', icon: <Layout size={20} /> },
      // Add more workspace specific settings here
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
       <UnifiedSidebar items={sidebarItems} activeItem="general" />
       
       <div style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
           <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Workspace Settings</h1>
           
           <div className="card" style={{ maxWidth: '600px' }}>
               <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Info size={18} /> General Information
               </h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Workspace Name</label>
                       <input 
                           type="text" 
                           value={name} 
                           onChange={e => setName(e.target.value)}
                           style={{ 
                               padding: '10px', 
                               borderRadius: '6px', 
                               border: '1px solid var(--border-color)', 
                               backgroundColor: 'var(--bg-secondary)', 
                               color: 'var(--text-primary)' 
                            }}
                       />
                   </div>

                   <button 
                       className="btn-primary" 
                       onClick={handleSave} 
                       disabled={loading}
                       style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                       <Save size={16} /> Save Changes
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
