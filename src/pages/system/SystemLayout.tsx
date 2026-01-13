import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, HardDrive, Activity, Package, Monitor, 
  ArrowLeft, Shield, Network, LogOut, RefreshCw, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { useTitle } from '../../hooks/useTitle';
import { useSettings } from '../../app/SettingsContext';
import UnifiedSidebar, { type SidebarItem } from '../../components/layout/UnifiedSidebar';

const SystemLayout: React.FC = () => {
  useTitle('System');
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useSettings();

  const handleNavigation = (path: string) => navigate(path);

  const sidebarItems: SidebarItem[] = [
    { id: 'back', label: 'Back to Workspace', icon: <ArrowLeft size={20} />, action: () => navigate('/workspace') },
    { isDivider: true, groupLabel: 'System Monitor' },
    { id: '/system', label: 'Overview', icon: <Monitor size={20} />, action: () => handleNavigation('/system') },
    { id: '/system/disk', label: 'Disk Manager', icon: <HardDrive size={20} />, action: () => handleNavigation('/system/disk') },
    { id: '/system/network', label: 'Network Monitor', icon: <Network size={20} />, action: () => handleNavigation('/system/network') },
    { id: '/system/tasks', label: 'Task Manager', icon: <Activity size={20} />, action: () => handleNavigation('/system/tasks') },
    { isDivider: true, groupLabel: 'Configuration' },
    { id: '/settings', label: 'Appearence', icon: <Settings size={20} />, action: () => handleNavigation('/settings') },
    { id: '/system/ftp-server', label: 'FTP Server', icon: <Monitor size={20} />, action: () => handleNavigation('/system/ftp-server') },
    { id: '/system/plugins', label: 'Plugins', icon: <Package size={20} />, action: () => handleNavigation('/system/plugins') },
    { id: '/system/logs', label: 'Activity Logs', icon: <ClipboardList size={20} />, action: () => handleNavigation('/system/logs') },
    { id: '/system/security', label: 'Security', icon: <Shield size={20} />, action: () => handleNavigation('/system/security') },
    { id: '/settings/system-update', label: 'System Update', icon: <RefreshCw size={20} />, action: () => handleNavigation('/settings/system-update') },
    { isDivider: true },
    { id: 'logout', label: 'Sign Out', icon: <LogOut size={20} />, action: logout },
  ];

  // Map current path to sidebar ID (simple exact match or prefix)
  const activeItem = sidebarItems.find(item => item.id === location.pathname)?.id || 
                     (location.pathname === '/system' ? '/system' : undefined);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <UnifiedSidebar 
          items={sidebarItems} 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
          activeItem={activeItem}
      />

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SystemLayout;