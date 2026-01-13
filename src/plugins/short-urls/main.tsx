import React from 'react'
import ReactDOM from 'react-dom/client'
import ShortUrlsApp from './ShortUrlsApp'
import '../../styles/global.css'
import '../../styles/theme.css'
import { ToastProvider } from '../../app/ToastContext'

console.log('ShortUrls main entry point loading...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <ShortUrlsApp />
    </ToastProvider>
  </React.StrictMode>,
)
