import React from 'react';
import { 
  Terminal, Code, Box, Cpu, Database, Globe, Layout, 
  Server, Smartphone, Cloud, Folder, FileCode, PenTool, 
  Zap, Activity, Hash, GitBranch, Command, Laptop, Layers
} from 'lucide-react';

export const ICON_SET = {
  Terminal, Code, Box, Cpu, Database, Globe, Layout, 
  Server, Smartphone, Cloud, Folder, FileCode, PenTool, 
  Zap, Activity, Hash, GitBranch, Command, Laptop, Layers
};

export type IconName = keyof typeof ICON_SET;

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  mode?: 'grid' | 'horizontal';
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, mode = 'grid' }) => {
  const containerStyle: React.CSSProperties = mode === 'grid' ? {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
      gap: '8px',
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '4px'
  } : {
      display: 'flex',
      gap: '8px',
      padding: '4px'
  };

  return (
    <div style={containerStyle}>
      {Object.entries(ICON_SET).map(([name, Icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: selectedIcon === name ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            border: `1px solid ${selectedIcon === name ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            color: selectedIcon === name ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0, /* Prevent shrinking in flex mode */
            width: '40px',
            height: '40px'
          }}
          title={name}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};

export const getIcon = (name: string, size: number = 24) => {
  const Icon = ICON_SET[name as IconName] || Terminal;
  return <Icon size={size} />;
};
