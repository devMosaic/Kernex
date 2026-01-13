import React from 'react'
import ReactDOM from 'react-dom/client'
import FileManager from './FileManager'
import '../../styles/theme.css'
import '../../styles/global.css'
import { ToastProvider } from '../../app/ToastContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <FileManager />
      </div>
    </ToastProvider>
  </React.StrictMode>,
)
