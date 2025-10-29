import React from 'react';
import { AuthProvider } from './features/auth/context/AuthContext';
import { useAuth } from './features/auth/context/AuthContext';
import { Auth } from './features/auth/components/Auth';
import { Dashboard } from './features/auth/components/Dashboard';
import './styles/App.css';

const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Dashboard /> : <Auth />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;