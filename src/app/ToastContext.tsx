import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import '../components/Toast.css';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${++idCounter.current}`;
    const newToast: Toast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
        // Trigger exit animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        
        // Remove from DOM after animation
        setTimeout(() => {
            removeToast(id);
        }, 300); 
    }, duration);
  }, [removeToast]);

  const success = (msg: string) => showToast(msg, 'success');
  const error = (msg: string) => showToast(msg, 'error');
  const info = (msg: string) => showToast(msg, 'info');
  const warning = (msg: string) => showToast(msg, 'warning');

  const getIcon = (type: ToastType) => {
      switch (type) {
          case 'success': return <CheckCircle size={20} color="#10b981" />;
          case 'error': return <AlertCircle size={20} color="#ef4444" />;
          case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
          default: return <Info size={20} color="var(--accent-primary)" />;
      }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type} ${toast.exiting ? 'exiting' : ''}`}
          >
            <div className="toast-icon">
                {getIcon(toast.type)}
            </div>
            <div className="toast-content">
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
