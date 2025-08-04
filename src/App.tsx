import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginPage from './components/LoginPage';
import Dashboard from './components/NewDashboard';
import Loading from './components/Loading';
import { GlobalStyles } from './styles/GlobalStyles';
import { apiService } from './services/api';
import { User } from './types';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
`;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure styled-components are fully loaded
    const loadApp = async () => {
      // Check for existing session
      const savedUser = localStorage.getItem('golf-society-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUser(user);
        apiService.setUser(user);
      }
      
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      setStylesLoaded(true);
      setLoading(false);
    };
    
    loadApp();
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
    apiService.setUser(null);
    localStorage.removeItem('golf-society-user');
  };

  if (loading || !stylesLoaded) {
    return <Loading />;
  }

  return (
    <ThemeProvider>
      <Router>
        <AppContainer>
          <GlobalStyles />
          <Routes>
            <Route 
              path="/login" 
              element={
                user?.isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user?.isAuthenticated ? 
                <Dashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
