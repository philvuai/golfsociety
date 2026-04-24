import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { PenTool, CheckCircle } from 'lucide-react';
import EventSidebar from './dashboard/EventSidebar';
import EventDetail from './dashboard/EventDetail';
import StatsBar from './dashboard/StatsBar';
import ExportActions from './dashboard/ExportActions';
import EditSidebar from './EditSidebar';
import MembersList from './MembersList';
import { LoadingContainer, ErrorContainer } from './common/Card';
import { Event, EventParticipant } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const Container = styled.div`
  display: flex;
  background: ${p => p.theme.colors.background};
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${p => p.theme.colors.backgroundPattern};
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
  @media (max-width: 768px) { flex-direction: column; }
`;

const Content = styled.div`
  flex: 1;
  padding: 32px;
  position: relative;
  z-index: 1;
  @media (max-width: 768px) { padding: 16px; }
`;

const Header = styled.div`margin-bottom: 32px;`;
const Title = styled.h1`color: ${p => p.theme.colors.text.primary}; font-size: 24px; font-weight: 600; margin-bottom: 8px;`;
const Subtitle = styled.p`color: ${p => p.theme.colors.text.secondary}; font-size: 14px;`;

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${p => p.theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${p => p.theme.shadows.glow};
  cursor: pointer;
  transition: all ${p => p.theme.animations.normal};
  z-index: 1000;
  &:hover { transform: translateY(-4px) scale(1.05); box-shadow: ${p => p.theme.shadows.xl}; }
`;

const CompleteFAB = styled(FAB)`
  bottom: 96px;
  background: ${p => p.theme.colors.status.success};
`;

interface DashboardProps {
  user: { username: string; role: 'admin' | 'viewer' };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editingNewEvent, setEditingNewEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'events' | 'members'>('events');
  const [participants, setParticipants] = useState<EventParticipant[]>([]);

  const { theme } = useTheme();
  const { showToast } = useToast();

  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await apiService.getEvents();
      setEvents(fetched);
      if (fetched.length > 0) setActiveEventId(fetched[0].id);
    } catch {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (!activeEvent?.id || user.role !== 'admin') { setParticipants([]); return; }
    apiService.getEventParticipants(activeEvent.id)
      .then(setParticipants)
      .catch(() => setParticipants([]));
  }, [activeEvent?.id, user.role]);

  const handleSave = async (updatedEvent: Event) => {
    try {
      if (editingNewEvent) {
        const created = await apiService.createEvent(updatedEvent);
        setEvents(prev => [...prev, created]);
        setActiveEventId(created.id);
        setEditingNewEvent(false);
        showToast('Event created successfully', 'success');
      } else {
        const saved = await apiService.updateEvent(updatedEvent);
        setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
        showToast('Event saved successfully', 'success');
      }
      setEditSidebarOpen(false);
    } catch {
      showToast('Failed to save event', 'error');
    }
  };

  const handleNewEvent = () => {
    setEditingNewEvent(true);
    setEditSidebarOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      await apiService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      if (activeEventId === eventId) {
        const remaining = events.filter(e => e.id !== eventId);
        setActiveEventId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast('Event deleted', 'success');
    } catch {
      showToast('Failed to delete event', 'error');
    }
  };

  const handleComplete = async () => {
    if (!activeEvent || activeEvent.status === 'completed') return;
    try {
      const updated = { ...activeEvent, status: 'completed' as const };
      await apiService.updateEvent(updated);
      setEvents(prev => prev.map(e => e.id === activeEvent.id ? updated : e));
      showToast('Event marked as complete', 'success');
    } catch {
      showToast('Failed to complete event', 'error');
    }
  };

  const newEventTemplate = useMemo<Event>(() => ({
    id: '', name: 'New Event', date: new Date().toISOString(), location: '', status: 'upcoming',
    playerCount: 0, playerFee: 0, playerGroup1Name: 'Members',
    playerCount2: 0, playerFee2: 0, playerGroup2Name: 'Guests',
    levy1Name: 'Leicestershire', levy1Value: 0, levy2Name: 'Regional', levy2Value: 0,
    courseFee: 0, cashInBank: 0, funds: { bankTransfer: 0, cash: 0, card: 0 }, surplus: 0, notes: ''
  }), [editingNewEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StyledThemeProvider theme={theme}>
      <Container>
        <EventSidebar
          user={user}
          events={events}
          activeEventId={activeEventId}
          currentView={currentView}
          onSelectEvent={setActiveEventId}
          onSelectView={setCurrentView}
          onNewEvent={handleNewEvent}
          onLogout={onLogout}
        />

        <Content>
          {currentView === 'members' && user.role === 'admin' ? (
            <MembersList user={user} />
          ) : (
            <>
              <Header>
                <Title>The Golf Society Dashboard</Title>
                <Subtitle>{user.role === 'admin' ? 'Manage your golf events, players, and finances' : 'View golf events, players, and finances'}</Subtitle>
              </Header>

              {error && <ErrorContainer>{error}</ErrorContainer>}

              {!loading && events.length > 0 && (
                <>
                  <StatsBar events={events} />
                  <ExportActions events={events} />
                </>
              )}

              {loading ? (
                <LoadingContainer>Loading events...</LoadingContainer>
              ) : activeEvent ? (
                <EventDetail event={activeEvent} participants={participants} />
              ) : (
                <LoadingContainer>
                  No events found. {user.role === 'admin' ? 'Create your first event using the + button.' : 'Please contact an admin to create events.'}
                </LoadingContainer>
              )}
            </>
          )}
        </Content>
      </Container>

      {user.role === 'admin' && activeEvent && (activeEvent.status === 'upcoming' || activeEvent.status === 'in-progress') && (
        <CompleteFAB onClick={handleComplete} title="Mark Event as Complete">
          <CheckCircle size={20} />
        </CompleteFAB>
      )}

      {user.role === 'admin' && (
        <FAB onClick={() => { setEditingNewEvent(false); setEditSidebarOpen(true); }}>
          <PenTool size={20} />
        </FAB>
      )}

      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => { setEditSidebarOpen(false); setEditingNewEvent(false); }}
        event={editingNewEvent ? newEventTemplate : activeEvent}
        onSave={handleSave}
        onDelete={editingNewEvent ? undefined : handleDelete}
      />
    </StyledThemeProvider>
  );
};

export default Dashboard;
