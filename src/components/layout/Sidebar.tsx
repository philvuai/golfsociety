import React from 'react';
import styled from 'styled-components';
import { Home, Calendar, Users, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SidebarContainer = styled.aside<{ collapsed: boolean }>`
  width: ${p => p.collapsed ? '60px' : '220px'};
  background: ${p => p.theme.colors.sidebar.background};
  border-right: 1px solid ${p => p.theme.colors.sidebar.border};
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  overflow: hidden;
  z-index: 50;

  @media (max-width: 768px) {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 0;
    transform: translateX(${p => p.collapsed ? '-100%' : '0'});
    width: 220px;
    z-index: 1001;
  }
`;

const MobileOverlay = styled.div<{ visible: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 56px; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    opacity: ${p => p.visible ? 1 : 0};
    visibility: ${p => p.visible ? 'visible' : 'hidden'};
    transition: opacity 0.2s, visibility 0.2s;
  }
`;

const NavSection = styled.div`
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  transition: all 0.15s;
  background: ${p => p.active ? p.theme.colors.sidebar.buttonActive : 'transparent'};
  color: ${p => p.active ? p.theme.colors.sidebar.text : p.theme.colors.sidebar.textSecondary};
  &:hover { background: ${p => p.theme.colors.sidebar.buttonHover}; color: ${p => p.theme.colors.sidebar.text}; }
  &::before { display: none; }

  svg { flex-shrink: 0; }
`;

const NavLabel = styled.span<{ collapsed: boolean }>`
  opacity: ${p => p.collapsed ? 0 : 1};
  transition: opacity 0.15s;
  overflow: hidden;
`;

const Divider = styled.div`
  height: 1px;
  background: ${p => p.theme.colors.sidebar.border};
  margin: 4px 12px;
`;

const ContextSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
`;

interface NavRoute {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const routes: NavRoute[] = [
  { path: '/dashboard', label: 'Home', icon: <Home size={18} /> },
  { path: '/events', label: 'Events', icon: <Calendar size={18} /> },
  { path: '/members', label: 'Members', icon: <Users size={18} />, adminOnly: true },
  { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
];

interface Props {
  collapsed: boolean;
  onCloseMobile: () => void;
  userRole: 'admin' | 'viewer';
  contextContent?: React.ReactNode;
}

const Sidebar: React.FC<Props> = ({ collapsed, onCloseMobile, userRole, contextContent }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onCloseMobile();
  };

  const visibleRoutes = routes.filter(r => !r.adminOnly || userRole === 'admin');

  return (
    <>
      <MobileOverlay visible={!collapsed} onClick={onCloseMobile} />
      <SidebarContainer collapsed={collapsed}>
        <NavSection>
          {visibleRoutes.map(r => (
            <NavItem key={r.path} active={location.pathname === r.path} onClick={() => handleNav(r.path)}>
              {r.icon}
              <NavLabel collapsed={collapsed}>{r.label}</NavLabel>
            </NavItem>
          ))}
        </NavSection>
        {contextContent && (
          <>
            <Divider />
            <ContextSection>{contextContent}</ContextSection>
          </>
        )}
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
