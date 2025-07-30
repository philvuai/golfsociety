import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Lock } from 'lucide-react';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #1e3c72;
  font-size: 28px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #2a5298;
  }

  &::placeholder {
    color: #999;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
`;

const LoginInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
`;

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <Title>The Golf Society</Title>
          <Subtitle>Dashboard Access</Subtitle>
        </Logo>
        
        <LoginInfo>
          <strong>Login Options:</strong><br/>
          • Admin: Full access to manage events<br/>
          • Viewer: Read-only access to view events
        </LoginInfo>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <User size={20} />
            </InputIcon>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </LoginButton>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
