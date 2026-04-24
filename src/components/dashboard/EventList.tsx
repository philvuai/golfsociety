import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus, Search } from 'lucide-react';
import { Event } from '../../types';

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;
  svg { position: absolute; left: 8px; top: 9px; color: ${p => p.theme.colors.sidebar.textSecondary}; }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid ${p => p.theme.colors.sidebar.border};
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: ${p => p.theme.colors.sidebar.text};
  font-size: 13px;
  &::placeholder { color: ${p => p.theme.colors.sidebar.textSecondary}; }
  &:focus { outline: none; border-color: ${p => p.theme.colors.accent.primary}; }
`;

const Section = styled.div`margin-bottom: 12px;`;
const SectionTitle = styled.h3`
  color: ${p => p.theme.colors.text.tertiary};
  font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;
  padding: 0 4px;
`;

const EventBtn = styled.button<{ active?: boolean }>`
  display: block;
  width: 100%;
  background: ${p => p.active ? p.theme.colors.sidebar.buttonActive : 'transparent'};
  color: ${p => p.active ? p.theme.colors.sidebar.text : p.theme.colors.sidebar.textSecondary};
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.15s;
  &:hover { background: ${p => p.theme.colors.sidebar.buttonHover}; color: ${p => p.theme.colors.sidebar.text}; }
  &::before { display: none; }
`;

const NewBtn = styled(EventBtn)`
  color: ${p => p.theme.colors.accent.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

interface Props {
  events: Event[];
  activeEventId: string | null;
  onSelectEvent: (id: string) => void;
  onNewEvent: () => void;
  isAdmin: boolean;
}

const EventList: React.FC<Props> = ({ events, activeEventId, onSelectEvent, onNewEvent, isAdmin }) => {
  const [search, setSearch] = useState('');
  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const renderGroup = (status: string, label: string) => {
    const items = filtered.filter(e => e.status === status);
    if (items.length === 0) return null;
    return (
      <Section>
        <SectionTitle>{label}</SectionTitle>
        {items.map(e => (
          <EventBtn key={e.id} active={e.id === activeEventId} onClick={() => onSelectEvent(e.id)}>
            {e.name}
          </EventBtn>
        ))}
      </Section>
    );
  };

  return (
    <>
      <SearchWrapper>
        <Search size={14} />
        <SearchInput placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
      </SearchWrapper>
      {renderGroup('in-progress', 'In Progress')}
      {renderGroup('upcoming', 'Upcoming')}
      {renderGroup('completed', 'Completed')}
      {isAdmin && (
        <NewBtn onClick={onNewEvent}>
          <Plus size={16} /> New Event
        </NewBtn>
      )}
    </>
  );
};

export default EventList;
