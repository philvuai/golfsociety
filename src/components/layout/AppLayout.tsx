import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  position: relative;
  &::before {
    content: '';
    position: fixed;
    top: 56px; left: 0; right: 0; bottom: 0;
    background: ${p => p.theme.colors.backgroundPattern};
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentInner = styled.div`
  position: relative;
  z-index: 1;
  padding: 32px;
  @media (max-width: 768px) { padding: 16px; }
`;

interface Props {
  user: { username: string; role: 'admin' | 'viewer' };
  onLogout: () => void;
  sidebarContext?: React.ReactNode;
  children: React.ReactNode;
}

const AppLayout: React.FC<Props> = ({ user, onLogout, sidebarContext, children }) => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleToggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const handleCloseMobile = useCallback(() => setMobileOpen(false), []);

  const sidebarCollapsed = isMobile ? !mobileOpen : collapsed;

  return (
    <StyledThemeProvider theme={theme}>
      <Wrapper>
        <TopBar
          username={user.username}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggle}
          onLogout={onLogout}
        />
        <Body>
          <Sidebar
            collapsed={sidebarCollapsed}
            onCloseMobile={handleCloseMobile}
            userRole={user.role}
            contextContent={sidebarContext}
          />
          <Content>
            <ContentInner>{children}</ContentInner>
          </Content>
        </Body>
      </Wrapper>
    </StyledThemeProvider>
  );
};

export default AppLayout;
