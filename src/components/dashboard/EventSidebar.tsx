import React, { useState } from 'react';
import styled from 'styled-components';
import { LogOut, Plus, Calendar, Users, Menu, X, Search } from 'lucide-react';
import { Event } from '../../types';

const SidebarWrapper = styled.div<{ isOpen: boolean }>`
  width: 280px;
  background: ${p => p.theme.colors.sidebar.background};
  backdrop-filter: ${p => p.theme.blur.md};
  color: ${p => p.theme.colors.sidebar.text};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid ${p => p.theme.colors.sidebar.border};
  position: relative;
  z-index: 10;
  overflow-y: auto;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(${p => p.isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease;
    z-index: 1001;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    opacity: ${p => p.isOpen ? 1 : 0};
    visibility: ${p => p.isOpen ? 'visible' : 'hidden'};
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: ${p => p.theme.colors.sidebar.background};
    color: ${p => p.theme.colors.sidebar.text};
    z-index: 5;
  }
`;

const HamburgerBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: flex;
  &::before { display: none; }
`;

const Title = styled.h2`
  font-size: 18px; font-weight: 600; margin-bottom: 16px;
  color: ${p => p.theme.colors.sidebar.text};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid ${p => p.theme.colors.sidebar.border};
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: ${p => p.theme.colors.sidebar.text};
  font-size: 13px;
  margin-bottom: 12px;
  &::placeholder { color: ${p => p.theme.colors.sidebar.textSecondary}; }
  &:focus { outline: none; border-color: ${p => p.theme.colors.accent.primary}; }
`;

const SearchWrapper = styled.div`
  position: relative;
  svg { position: absolute; left: 8px; top: 9px; color: ${p => p.theme.colors.sidebar.textSecondary}; }
`;

const Section = styled.div`margin-bottom: 16px;`;
const SectionTitle = styled.h3`
  color: ${p => p.theme.colors.text.tertiary};
  font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;
`;

const SidebarButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: ${p => p.active ? p.theme.colors.sidebar.buttonActive : 'transparent'};
  color: ${p => p.active ? p.theme.colors.sidebar.text : p.theme.colors.sidebar.textSecondary};
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  &:hover { background: ${p => p.theme.colors.sidebar.buttonHover}; color: ${p => p.theme.colors.sidebar.text}; }
  &::before { display: none; }
`;

interface Props {
  user: { username: string; role: 'admin' | 'viewer' };
  events: Event[];
  activeEventId: string | null;
  currentView: 'events' | 'members';
  onSelectEvent: (id: string) => void;
  onSelectView: (view: 'events' | 'members') => void;
  onNewEvent: () => void;
  onLogout: () => void;
}

const EventSidebar: React.FC<Props> = ({ user, events, activeEventId, currentView, onSelectEvent, onSelectView, onNewEvent, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (id: string) => {
    onSelectEvent(id);
    setMobileOpen(false);
  };

  const renderEventList = (status: string, label: string) => {
    const items = filtered.filter(e => e.status === status);
    if (items.length === 0) return null;
    return (
      <Section>
        <SectionTitle>{label}</SectionTitle>
        {items.map(e => (
          <SidebarButton key={e.id} active={e.id === activeEventId} onClick={() => handleSelect(e.id)}>
            {e.name}
          </SidebarButton>
        ))}
      </Section>
    );
  };

  const sidebarContent = (
    <>
      <Title>Welcome, {user.username}</Title>

      {user.role === 'admin' && (
        <Section>
          <SectionTitle>Navigation</SectionTitle>
          <SidebarButton active={currentView === 'events'} onClick={() => onSelectView('events')}>
            <Calendar size={18} /> Events
          </SidebarButton>
          <SidebarButton active={currentView === 'members'} onClick={() => onSelectView('members')}>
            <Users size={18} /> Members
          </SidebarButton>
        </Section>
      )}

      {currentView === 'events' && (
        <>
          <SearchWrapper>
            <Search size={14} />
            <SearchInput placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </SearchWrapper>
          {renderEventList('in-progress', 'In Progress')}
          {renderEventList('upcoming', 'Upcoming')}
          {renderEventList('completed', 'Completed')}
          {user.role === 'admin' && (
            <SidebarButton onClick={onNewEvent}>
              <Plus size={18} /> New Event
            </SidebarButton>
          )}
        </>
      )}

      <SidebarButton onClick={onLogout}>
        <LogOut size={18} /> Log Out
      </SidebarButton>
    </>
  );

  return (
    <>
      <MobileHeader>
        <HamburgerBtn onClick={() => setMobileOpen(true)}>
          <Menu size={24} />
        </HamburgerBtn>
        <span style={{ marginLeft: 12, fontWeight: 600 }}>Golf Society</span>
      </MobileHeader>
      <Overlay isOpen={mobileOpen} onClick={() => setMobileOpen(false)} />
      <SidebarWrapper isOpen={mobileOpen}>
        <div style={{ display: 'none' }}>
          {/* Close button for mobile */}
        </div>
        <div className="mobile-close" style={{ display: 'none' }}>
          <HamburgerBtn onClick={() => setMobileOpen(false)}><X size={20} /></HamburgerBtn>
        </div>
        {sidebarContent}
      </SidebarWrapper>
    </>
  );
};

export default EventSidebar;
