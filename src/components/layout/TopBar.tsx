import React from 'react';
import styled from 'styled-components';
import { Sun, Moon, LogOut, Menu, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: ${p => p.theme.colors.sidebar.background};
  border-bottom: 1px solid ${p => p.theme.colors.sidebar.border};
  z-index: 100;
`;

const Left = styled.div`display: flex; align-items: center; gap: 12px;`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.colors.sidebar.textSecondary};
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  &:hover { background: ${p => p.theme.colors.sidebar.buttonHover}; color: ${p => p.theme.colors.sidebar.text}; }
  &::before { display: none; }
`;

const Logo = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${p => p.theme.colors.sidebar.text};
  letter-spacing: -0.3px;
`;

const Right = styled.div`display: flex; align-items: center; gap: 8px;`;

const Username = styled.span`
  font-size: 13px;
  color: ${p => p.theme.colors.sidebar.textSecondary};
  font-weight: 500;
  @media (max-width: 768px) { display: none; }
`;

interface Props {
  username: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const TopBar: React.FC<Props> = ({ username, sidebarCollapsed, onToggleSidebar, onLogout }) => {
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <Bar>
      <Left>
        <IconBtn onClick={onToggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </IconBtn>
        <Logo>The Golf Society</Logo>
      </Left>
      <Right>
        <IconBtn onClick={toggleTheme} title={isDarkMode ? 'Light mode' : 'Dark mode'}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </IconBtn>
        <Username>{username}</Username>
        <IconBtn onClick={onLogout} title="Log out">
          <LogOut size={18} />
        </IconBtn>
      </Right>
    </Bar>
  );
};

export default TopBar;
