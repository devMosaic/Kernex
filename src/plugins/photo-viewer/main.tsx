import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const PhotoViewer = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get('file');

    if (!filePath) {
      setTimeout(() => {
          setError('No file specified.');
          setLoading(false);
      }, 0);
      return;
    }

    // Use the raw file endpoint
    // We assume the backend will provide /api/files/raw?path=...
    const url = `/api/files/raw?path=${encodeURIComponent(filePath)}`;
    setTimeout(() => {
        setImageUrl(url);
        setLoading(false);
    }, 0);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#888'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#ff6b6b',
        padding: '20px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#000' 
    }}>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Viewer" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain' 
          }} 
        />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PhotoViewer />
  </React.StrictMode>
);
