import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FilePlus, FolderPlus, RefreshCw, Save, Edit2, Trash2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import './FileManager.css';
import { pluginFetch } from '../authHelper';
import { useToast } from '../../app/ToastContext';
import { FileTreeItem, type FileNode } from './components/FileTreeItem';
import { getFileIcon } from './components/FileIcons';

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'go':
      return 'go';
    default:
      return 'plaintext';
  }
};

const FileManager = () => {
  const { success, error } = useToast();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: FileNode | null }>({ visible: false, x: 0, y: 0, node: null });
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // New State for Inline Creation
  const [newFileParent, setNewFileParent] = useState<string | null>(null);
  const [newFileType, setNewFileType] = useState<'file' | 'folder' | null>(null);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false); // Special case for root
  const [createRootName, setCreateRootName] = useState('');
  const rootInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingRoot && rootInputRef.current) {
        rootInputRef.current.focus();
        setCreateRootName('');
    }
  }, [isCreatingRoot]);

  const fmTreeRef = useRef<HTMLDivElement>(null);

  const loadTree = useCallback(async () => {
    try {
      const res = await pluginFetch('/api/files/tree');
      if (!res.ok) throw new Error('Failed to load tree');
      const data = await res.json();
      setTree(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTree([]);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = async (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedPath(node.path);
      try {
        const res = await pluginFetch(`/api/files/read?path=${encodeURIComponent(node.path)}`);
        if (!res.ok) throw new Error('Failed to read file');
        const data = await res.json();
        setFileContent(data.content || '');
      } catch (e) {
        console.error(e);
        setFileContent('Error loading file content.');
      }
    } else {
      toggleFolder(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // Start creation process
  const handleCreate = async (type: 'file' | 'folder', parentNode: FileNode | null) => {
      setNewFileType(type);
      if (parentNode) {
          setNewFileParent(parentNode.path);
          setIsCreatingRoot(false);
          if (parentNode.type === 'folder') {
               setExpandedFolders(prev => new Set(prev).add(parentNode.path));
          }
      } else {
          setNewFileParent(null);
          setIsCreatingRoot(true);
      }
  };
  
  // Submit creation
  const handleCreateSubmit = async (name: string) => {
      setNewFileParent(null);
      setIsCreatingRoot(false);
      setNewFileType(null);
      
      if (!name) return;

      const parentPath = newFileParent || '';
      const newPath = parentPath ? `${parentPath}/${name}` : name;

      try {
        const res = await pluginFetch('/api/files/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: newPath, type: newFileType })
        });
        if (res.ok) {
            loadTree();
            // Ensure parent stays expanded
            if (parentPath) setExpandedFolders(prev => new Set(prev).add(parentPath));
        } else {
            const err = await res.json();
            error(err.message || 'Failed to create');
        }
      } catch (e) {
          console.error(e);
      }
  };

  const startRename = (node: FileNode) => {
    setEditingPath(node.path);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleRenameSubmit = async (node: FileNode, newName: string) => {
    setEditingPath(null);
    if (!newName || newName === node.name) return;

    const parts = node.path.split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');

    try {
      const res = await pluginFetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath: node.path, newPath })
      });
      if (res.ok) {
        loadTree();
        if (selectedPath === node.path) setSelectedPath(newPath);
      } else {
        const err = await res.json();
        error(err.message || 'Failed to rename');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (node: FileNode) => {
    if (!window.confirm(`Delete ${node.name}?`)) return;

    try {
      const res = await pluginFetch(`/api/files/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: node.path })
      });
      if (res.ok) {
        loadTree();
        if (selectedPath === node.path) setSelectedPath(null);
      } else {
        const err = await res.json();
        error(err.message || 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!selectedPath) return;
    try {
      const res = await pluginFetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath, content: fileContent })
      });
      if (res.ok) {
        success('Saved!');
      } else {
        const err = await res.json();
        error(err.message || 'Failed to save');
      } 
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.setData('application/kernex-file', JSON.stringify(node));
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent, targetNode: FileNode | null) => {
    e.preventDefault();
    e.stopPropagation();

    const targetPath = targetNode 
      ? (targetNode.type === 'folder' ? targetNode.path : targetNode.path.split('/').slice(0, -1).join('/')) 
      : '';

    // Handle Internal Move
    const internalData = e.dataTransfer.getData('application/kernex-file');
    if (internalData) {
      try {
        const sourceNode = JSON.parse(internalData);
        if (sourceNode.path === targetNode?.path) return;

        const newPath = targetPath ? `${targetPath}/${sourceNode.name}` : sourceNode.name;
        if (newPath === sourceNode.path) return;

        const res = await pluginFetch('/api/files/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPath: sourceNode.path, newPath })
        });
        
        if (res.ok) {
          loadTree();
        } else {
          error('Move failed');
        }
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Handle External File Upload
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploading(true);

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          // Use authenticated XHR or fetch wrapper if supported. 
          // Since pluginFetch is a wrapper around fetch, but we need FormData support.
          // authFetch supports FormData automatically if body is FormData (browser behavior) 
          // but we shouldn't set Content-Type header manually.
          
          const targetDir = targetPath || '';
          const url = `/api/files/upload?targetDir=${encodeURIComponent(targetDir)}`;
          
          const res = await pluginFetch(url, {
             method: 'POST',
             body: formData,
             // Do NOT set Content-Type: multipart/form-data here, let browser do it
             headers: {} 
          });

          if (!res.ok) {
             const err = await res.json();
             error(err.message || 'Upload failed');
          }
        } catch (e) {
          console.error('Upload failed', e);
          error('Upload failed');
        }
      }
      
      setUploading(false);
      loadTree();
      if (targetPath) setExpandedFolders(prev => new Set(prev).add(targetPath));
    }
  };
  
  const handleRootCreateKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleCreateSubmit(createRootName);
      } else if (e.key === 'Escape') {
          setIsCreatingRoot(false);
          setNewFileType(null);
      }
  }

  return (
    <div className="file-manager">
      <div className="fm-sidebar">
        <div className="fm-header">
          <span>EXPLORER</span>
          <div className="fm-header-actions">
            <button className="icon-btn" onClick={() => handleCreate('file', null)} title="New File"><FilePlus size={14} /></button>
            <button className="icon-btn" onClick={() => handleCreate('folder', null)} title="New Folder"><FolderPlus size={14} /></button>
            <button className="icon-btn" onClick={loadTree} title="Refresh"><RefreshCw size={14} /></button>
          </div>
        </div>
        <div 
          className="fm-tree" 
          ref={fmTreeRef}
          onContextMenu={(e) => handleContextMenu(e, null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, null)}
        >
          {tree.map(node => (
            <FileTreeItem 
              key={node.path}
              node={node}
              level={0}
              selectedPath={selectedPath}
              expandedFolders={expandedFolders}
              onToggle={toggleFolder}
              onSelect={handleFileClick}
              onContextMenu={handleContextMenu}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              editingPath={editingPath}
              onRenameSubmit={handleRenameSubmit}
              onRenameCancel={() => setEditingPath(null)}
              newFileParent={newFileParent}
              newFileType={newFileType}
              onCreateSubmit={handleCreateSubmit}
              onCreateCancel={() => { setNewFileParent(null); setNewFileType(null); }}
            />
          ))}
          
          {/* Root Level Creation Input */}
          {isCreatingRoot && (
              <div 
                className="file-row editing" 
                style={{ paddingLeft: '8px' }}
              >
                <span className="toggle-icon" style={{ visibility: 'hidden' }}></span>
                <span className="file-icon">
                    {getFileIcon(createRootName, newFileType === 'folder', false)}
                </span>
                <input
                    ref={rootInputRef}
                    type="text"
                    className="rename-input"
                    value={createRootName}
                    onChange={(e) => setCreateRootName(e.target.value)}
                    onKeyDown={handleRootCreateKeyDown}
                    onBlur={() => handleCreateSubmit(createRootName)}
                    onClick={(e) => e.stopPropagation()}
                />
              </div>
          )}
          
          {tree.length === 0 && !isCreatingRoot && <div className="empty-state">Empty Workspace</div>}
        </div>
      </div>
      
      <div className="fm-editor">
        {selectedPath ? (
          <>
            <div className="editor-tabs">
              <div className="active-tab">
                {getFileIcon(selectedPath, false, false)}
                <span>{selectedPath.split('/').pop()}</span>
              </div>
              <div className="editor-actions">
                <button onClick={handleSave} className="save-btn" title="Save (Cmd+S)">
                   <Save size={12} style={{marginRight: 4}}/> Save
                </button>
              </div>
            </div>
            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                language={getLanguageFromPath(selectedPath)}
                value={fileContent}
                theme="vs-dark"
                onChange={(value) => setFileContent(value || '')}
                options={{
                  minimap: { enabled: true },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderWhitespace: 'selection',
                }}
              />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div style={{ marginBottom: 16 }}>
               <RefreshCw size={48} opacity={0.2} />
            </div>
            <p>Select a file to view</p>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div 
          className="context-menu" 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.node ? (
            <>
              <div className="menu-item" onClick={() => { handleCreate('file', contextMenu.node); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                <FilePlus size={14} /> New File
              </div>
              <div className="menu-item" onClick={() => { handleCreate('folder', contextMenu.node); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                <FolderPlus size={14} /> New Folder
              </div>
              <div className="menu-separator" />
              <div className="menu-item" onClick={() => startRename(contextMenu.node!)}>
                <Edit2 size={14} /> Rename
              </div>
              <div className="menu-item" onClick={() => { handleDelete(contextMenu.node!); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                <Trash2 size={14} /> Delete
              </div>
            </>
          ) : (
             <>
              <div className="menu-item" onClick={() => { handleCreate('file', null); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                <FilePlus size={14} /> New File
              </div>
              <div className="menu-item" onClick={() => { handleCreate('folder', null); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                <FolderPlus size={14} /> New Folder
              </div>
             </>
          )}
        </div>
      )}
      
      {uploading && (
         <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#007fd4', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
            Uploading...
         </div>
      )}
    </div>
  );
};

export default FileManager;