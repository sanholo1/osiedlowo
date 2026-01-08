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
import { AdminPage } from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  if (isLoggedIn) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
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
                <UserRoute>
                  <HomePage />
                </UserRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <UserRoute>
                  <ProfilePage />
                </UserRoute>
              }
            />
            <Route
              path="/groupcreating"
              element={
                <UserRoute>
                  <GroupCreatingPage />
                </UserRoute>
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
              path="/direct-messages"
              element={
                <ProtectedRoute>
                  <DirectMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groupslist"
              element={
                <UserRoute>
                  <UsersGroupsListPage />
                </UserRoute>
              }
            />
            <Route
              path="/search"
              element={
                <UserRoute>
                  <SearchForGroupPage />
                </UserRoute>
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
                <UserRoute>
                  <GroupPage />
                </UserRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <UserRoute>
                  <NotificationsPage />
                </UserRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
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