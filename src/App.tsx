import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginPage from './components/LoginPage';
import EventsPage from './components/EventsPage';
import DashboardHome from './components/DashboardHome';
import MembersList from './components/MembersList';
import LeaderboardPage from './components/LeaderboardPage';
import AppLayout from './components/layout/AppLayout';
import { GlobalStyles } from './styles/GlobalStyles';
import { apiService } from './services/api';
import { User } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/Toast';

const AppContainer = styled.div`
  min-height: 100vh;
`;

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('golf-society-user');
    const savedToken = localStorage.getItem('golf-society-token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await apiService.login(username, password);
      setUser(user);
      localStorage.setItem('golf-society-user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    apiService.logout();
  };

  const AuthLayout: React.FC<{ children: React.ReactNode; sidebarContext?: React.ReactNode }> = ({ children, sidebarContext }) => (
    <AppLayout user={user!} onLogout={handleLogout} sidebarContext={sidebarContext}>
      {children}
    </AppLayout>
  );

  return (
    <ThemeProvider>
      <ToastProvider>
      <Router>
        <AppContainer>
          <GlobalStyles />
          <ToastContainer />
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
            />
            <Route
              path="/dashboard"
              element={user ? <AuthLayout><DashboardHome user={user} /></AuthLayout> : <Navigate to="/login" replace />}
            />
            <Route
              path="/events"
              element={user ? <EventsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/members"
              element={user ? (
                user.role === 'admin'
                  ? <AuthLayout><MembersList user={user} /></AuthLayout>
                  : <Navigate to="/dashboard" replace />
              ) : <Navigate to="/login" replace />}
            />
            <Route
              path="/leaderboard"
              element={user ? <AuthLayout><LeaderboardPage /></AuthLayout> : <Navigate to="/login" replace />}
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppContainer>
      </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
