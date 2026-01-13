import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './routes';
import '../styles/global.css';
import { SettingsProvider } from './SettingsContext';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';

function AppContent() {
  const content = useRoutes(routes);
  return content;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
