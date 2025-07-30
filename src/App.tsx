import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginPage from './components/LoginPage';
import Dashboard from './components/NewDashboard';
import { GlobalStyles } from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
`;

interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  isAuthenticated: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('golf-society-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (username: string, password: string) => {
    // Simple authentication - in production, this would be handled by Netlify Identity
    let newUser: User | null = null;
    
    if (username === 'admin' && password === 'golfsociety2024') {
      newUser = {
        id: '1',
        username,
        role: 'admin',
        isAuthenticated: true
      };
    } else if (username === 'viewer' && password === 'viewonly2024') {
      newUser = {
        id: '2',
        username,
        role: 'viewer',
        isAuthenticated: true
      };
    }
    
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('golf-society-user', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('golf-society-user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
  );
}

export default App;
