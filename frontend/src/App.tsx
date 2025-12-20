import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import './App.css';
import { RegulationsPage } from './pages/RegulationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { GroupCreatingPage } from './pages/GroupCreatingPage';
import { UsersGroupsListPage } from './pages/UsersGroupsListPage';
import { SearchForGroupPage } from './pages/SearchForGroupPage';
import { SettingsPage } from './pages/SettingsPage';
import { GroupPage } from './pages/GroupPage';
import { DirectMessagesPage } from './pages/DirectMessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? <>{children}</> : <Navigate to="/home" replace />;
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/regulations"
              element={
                <PublicRoute>
                  <RegulationsPage />
                </PublicRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groupcreating"
              element={
                <ProtectedRoute>
                  <GroupCreatingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <DirectMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groupslist"
              element={
                <ProtectedRoute>
                  <UsersGroupsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchForGroupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group"
              element={
                <ProtectedRoute>
                  <GroupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;