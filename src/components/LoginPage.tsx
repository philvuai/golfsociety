import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: ${p => p.theme.colors.background};
`;

const LoginCard = styled.div`
  background: ${p => p.theme.colors.surfaceElevated};
  border-radius: 20px;
  padding: 40px;
  box-shadow: ${p => p.theme.shadows.xl};
  border: 1px solid ${p => p.theme.colors.border.medium};
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${p => p.theme.colors.text.primary};
  font-size: 28px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: ${p => p.theme.colors.text.secondary};
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
  color: ${p => p.theme.colors.text.tertiary};
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid ${p => p.theme.colors.border.medium};
  border-radius: 10px;
  font-size: 16px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${p => p.theme.colors.accent.primary};
    outline: none;
  }

  &::placeholder {
    color: ${p => p.theme.colors.text.tertiary};
  }
`;

const LoginButton = styled.button`
  background: ${p => p.theme.colors.gradient.secondary};
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
  color: ${p => p.theme.colors.status.error};
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
`;

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

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
    <StyledThemeProvider theme={theme}>
      <LoginContainer>
        <LoginCard>
          <Logo>
            <Title>The Golf Society</Title>
            <Subtitle>Dashboard Access</Subtitle>
          </Logo>

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
                autoFocus
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
    </StyledThemeProvider>
  );
};

export default LoginPage;
