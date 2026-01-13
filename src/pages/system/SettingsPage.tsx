import React, { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import './SettingsPage.css';
import { useSettings } from '../../app/SettingsContext';
import { useTitle } from '../../hooks/useTitle';
import { useToast } from '../../app/ToastContext';

const SettingsPage: React.FC = () => {
  useTitle('Settings');
  const { settings, updateSettings } = useSettings();
  const { success, error } = useToast();
  const [localSettings, setLocalSettings] = useState<any>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: string, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    setHasChanges(true);
    
    if (['fontSize', 'uiDensity', 'canvasGrid', 'canvasSnapToGrid'].includes(key)) {
        updateSettings({ [key]: value });
    }
  };

  const handleThemeChange = (themeId: string) => {
    if (localSettings.themeId === themeId) return;
    const updated = { ...localSettings, themeId };
    setLocalSettings(updated);
    updateSettings({ themeId });
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      success('Settings saved successfully');
    } catch (e) {
      console.error(e);
      error('Failed to save settings');
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (scrollRef.current) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              scrollRef.current.style.scrollBehavior = 'auto';
              scrollRef.current.scrollLeft += e.deltaY;
              scrollRef.current.style.scrollBehavior = 'smooth';
          }
      }
  };

  const themes = [
    'obsidian-black', 'midnight-carbon', 'obsidian-flow', 'graphite-ui', 'deep-space', 'neon-purple'
  ];

  const renderField = (key: string, label: string, type: 'text' | 'number' | 'boolean' | 'select', options?: string[]) => {
    const val = localSettings[key];
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          {label}
        </label>
        {type === 'boolean' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={() => handleChange(key, !val)}
              style={{
                width: 40, height: 20, borderRadius: 10,
                backgroundColor: val ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                position: 'relative', transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white',
                position: 'absolute', top: 2,
                left: val ? 22 : 2,
                transition: 'left 0.2s'
              }} />
            </button>
            <span style={{ fontSize: 13 }}>{val ? 'Enabled' : 'Disabled'}</span>
          </div>
        ) : type === 'select' ? (
          <select 
            value={val} 
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ width: '100%', maxWidth: 300, padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={val || ''}
            onChange={(e) => handleChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
            style={{ width: '100%', maxWidth: 300 }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Appearance</h1>
        <button 
          className="btn-primary" 
          disabled={!hasChanges}
          onClick={handleSave}
          style={{ opacity: hasChanges ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="card">
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Theme Selection
            </label>
            <div className="theme-selector-container">
                <div 
                    className="theme-scroll-viewport" 
                    ref={scrollRef}
                    onWheel={handleWheel}
                >
                    {themes.map(t => (
                        <div 
                            key={t} 
                            className={`theme-card ${localSettings.themeId === t ? 'active' : ''}`}
                            onClick={() => handleThemeChange(t)}
                            data-theme={t}
                        >
                            <div className="theme-preview-box">
                                <div className="theme-preview-header" />
                                <div className="theme-preview-body">
                                    <div className="theme-preview-sidebar" />
                                    <div className="theme-preview-content">
                                        <div className="theme-preview-accent" />
                                        <div className="theme-preview-line" />
                                        <div className="theme-preview-line" style={{ width: '80%' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="theme-label">{t.replace(/-/g, ' ')}</div>
                            <div className="theme-name-tooltip">{t.replace(/-/g, ' ')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {renderField('fontSize', 'Base Font Size (px)', 'number')}
            {renderField('uiDensity', 'UI Density', 'select', ['compact', 'normal', 'spacious'])}
            {renderField('canvasGrid', 'Show Canvas Grid', 'boolean')}
            {renderField('canvasSnapToGrid', 'Snap to Grid', 'boolean')}
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;