import React from 'react';
import './UnifiedSidebar.css';
import { ChevronLeft } from 'lucide-react';

export type SidebarItem = 
  | {
      id: string;
      label: string;
      icon: React.ReactNode;
      action?: () => void;
      isDivider?: false;
      groupLabel?: never;
    }
  | {
      isDivider: true;
      groupLabel?: string;
      id?: string;
      label?: never;
      icon?: never;
      action?: never;
    };

interface UnifiedSidebarProps {
  items: SidebarItem[];
  footerItems?: SidebarItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeItem?: string;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({ 
  items, 
  footerItems = [],
  isCollapsed = false, 
  onToggleCollapse, 
  activeItem 
}) => {
  return (
    <div 
        className={`unified-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        onClick={(e) => {
            if (isCollapsed && onToggleCollapse && e.target === e.currentTarget) {
                onToggleCollapse();
            }
        }}
    >
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 5px', overflow: 'hidden' }}>
            <img src="/kernex.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0 }} />
            <span className="sidebar-brand-text">Kernex Workspace </span>
        </div>
        {onToggleCollapse && !isCollapsed && (
            <button onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }} className="toggle-btn">
                <ChevronLeft size={20} />
            </button>
        )}
      </div>

      <div className="sidebar-content">
        {items.map((item, index) => renderItem(item, index, activeItem, isCollapsed))}
        
        <div style={{ flex: 1 }} onClick={() => {
             if (isCollapsed && onToggleCollapse) {
                 onToggleCollapse();
             }
        }} />

        {footerItems.map((item, index) => renderItem(item, `footer-${index}`, activeItem, isCollapsed))}
      </div>
    </div>
  );
};

const renderItem = (item: SidebarItem, key: string | number, activeItem: string | undefined, isCollapsed: boolean) => {
    if (item.isDivider) {
        if (isCollapsed) return <div key={key} className="sidebar-divider" />;
        return (
            <div key={key} className="sidebar-group-label">
                {item.groupLabel || ''}
            </div>
        );
    }

    return (
        <div
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={item.action}
            title={isCollapsed ? item.label : ''}
        >
            <div className="icon-container">{item.icon}</div>
            <span className="label">{item.label}</span>
        </div>
    );
};

export default UnifiedSidebar;
