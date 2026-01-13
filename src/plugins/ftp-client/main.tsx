import React from 'react'
import ReactDOM from 'react-dom/client'
import FtpClientApp from './FtpClientApp'
import '../../styles/global.css'
import '../../styles/theme.css'
import { ToastProvider } from '../../app/ToastContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <FtpClientApp />
    </ToastProvider>
  </React.StrictMode>,
)
