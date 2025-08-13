import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { LogOut, Plus, PenTool, CheckCircle, Download, FileText, Moon, Sun, Users, Calendar } from 'lucide-react';
import EditSidebar from './EditSidebar';
import MembersList from './MembersList';
import { Event, EventParticipant } from '../types';
import { formatDateBritish } from '../utils/dateUtils';
import { apiService } from '../services/api';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DashboardContainer = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.colors.backgroundPattern};
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: ${props => props.theme.colors.sidebar.background};
  backdrop-filter: ${props => props.theme.blur.md};
  -webkit-backdrop-filter: ${props => props.theme.blur.md};
  color: ${props => props.theme.colors.sidebar.text};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid ${props => props.theme.colors.sidebar.border};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.colors.sidebar.border};
  }
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.sidebar.text};
`;

const SidebarButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: ${props => props.active ? props.theme.colors.sidebar.buttonActive : 'transparent'};
  color: ${props => props.active ? props.theme.colors.sidebar.text : props.theme.colors.sidebar.textSecondary};
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.sidebar.buttonHover};
    color: ${props => props.theme.colors.sidebar.text};
  }
`;

const EventsSection = styled.div`
  margin-bottom: 16px;
`;

const EventsSectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.colors.status.info};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }
`;

const exportToCSV = (events: Event[]) => {
  const csvRows = [
    ["Name", "Date", "Location", "Status", "Total Players", "Surplus"],
    ...events.map(event => [
      event.name || 'Untitled Event',
      new Date(event.date).toLocaleDateString('en-GB'),
      event.location || 'TBD',
      event.status || 'unknown',
      (event.playerCount || 0) + (event.playerCount2 || 0),
      `£${(event.surplus || 0).toFixed(2)}`
    ])
  ];

  const csvContent = "data:text/csv;charset=utf-8," 
    + csvRows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `golf_events_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const exportToPDF = (events: Event[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text("Golf Society Events Report", 14, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 30);
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [['Name', 'Date', 'Location', 'Status', 'Players', 'Surplus']],
    body: events.map(event => [
      event.name || 'Untitled Event',
      new Date(event.date).toLocaleDateString('en-GB'),
      event.location || 'TBD',
      event.status || 'unknown',
      (event.playerCount || 0) + (event.playerCount2 || 0),
      `£${(event.surplus || 0).toFixed(2)}`
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.save(`golf_events_${new Date().toISOString().split('T')[0]}.pdf`);
};

const Content = styled.div`
  flex: 1;
  padding: 32px;
  background: transparent;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  backdrop-filter: ${props => props.theme.blur.md};
  -webkit-backdrop-filter: ${props => props.theme.blur.md};
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid ${props => props.theme.colors.border.medium};
  box-shadow: ${props => props.theme.shadows.medium};
  transition: all ${props => props.theme.animations.normal};
  animation: slideIn 0.6s ease-out;
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${props => props.theme.shadows.large};
    border-color: ${props => props.theme.colors.accent.primary};
  }
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatCardLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  backdrop-filter: ${props => props.theme.blur.md};
  -webkit-backdrop-filter: ${props => props.theme.blur.md};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border.medium};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
  transition: all ${props => props.theme.animations.normal};
  animation: slideIn 0.8s ease-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.colors.gradient.mesh};
    opacity: 0.02;
    border-radius: inherit;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.theme.shadows.xl};
    border-color: ${props => props.theme.colors.accent.primary};
    
    &::before {
      opacity: 0.05;
    }
  }
`;

const CardHeader = styled.div`
  padding: 24px 28px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
`;

const CardContent = styled.div`
  padding: 24px 28px;
  position: relative;
  z-index: 1;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const EventLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const EventValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const FundsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FundItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
    font-weight: 600;
    padding-top: 12px;
    border-top: 1px solid ${props => props.theme.colors.border.medium};
  }
`;

const FundLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const FundAmount = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const SurplusCard = styled(Card)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
`;

const SurplusHeader = styled(CardHeader)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const SurplusTitle = styled(CardTitle)`
  color: white;
`;

const SurplusValue = styled(StatValue)`
  color: white;
`;

const NotesCard = styled(Card)`
  grid-column: 1 / -1;
`;

const NotesText = styled.div`
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ParticipantsCard = styled(Card)`
  grid-column: 1 / -1;
`;

const ParticipantsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.accent.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.small};
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const ParticipantDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ParticipantBadge = styled.span<{ variant: 'group' | 'handicap' }>`
  background: ${props => 
    props.variant === 'group' ? props.theme.colors.accent.primary : props.theme.colors.surface
  };
  color: ${props => 
    props.variant === 'group' ? 'white' : props.theme.colors.text.secondary
  };
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
`;

const PaymentStatus = styled.div<{ isPaid: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.isPaid ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.isPaid ? '#15803d' : '#d97706'};
  border: 1px solid ${props => props.isPaid ? '#bbf7d0' : '#fed7aa'};
`;

const PaymentIndicator = styled.div<{ isPaid: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isPaid ? '#15803d' : '#d97706'};
`;

const ParticipantsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 12px;
  margin-bottom: 16px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #b91c1c;
  font-size: 14px;
`;

const FloatingActionButton = styled.button<{ theme: Theme }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${props => props.theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.glow};
  cursor: pointer;
  transition: all ${props => props.theme.animations.normal};
  z-index: 1000;
  backdrop-filter: ${props => props.theme.blur.sm};
  -webkit-backdrop-filter: ${props => props.theme.blur.sm};

  &:hover {
    background: ${props => props.theme.colors.status.info};
    transform: translateY(-4px) scale(1.05);
    box-shadow: ${props => props.theme.shadows.xl}, ${props => props.theme.shadows.glow};
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const CompleteEventButton = styled.button<{ theme: Theme }>`
  position: fixed;
  bottom: 96px;
  right: 24px;
  background: ${props => props.theme.colors.status.success};
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.glow};
  cursor: pointer;
  transition: all ${props => props.theme.animations.normal};
  z-index: 1000;
  backdrop-filter: ${props => props.theme.blur.sm};
  -webkit-backdrop-filter: ${props => props.theme.blur.sm};

  &:hover {
    background: ${props => props.theme.colors.accent.primary};
    transform: translateY(-4px) scale(1.05);
    box-shadow: ${props => props.theme.shadows.xl}, ${props => props.theme.shadows.glow};
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

interface DashboardProps {
  user: { username: string; role: 'admin' | 'viewer'; };
  onLogout: () => void;
}


const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'events' | 'members'>('events');
  const [participants, setParticipants] = useState<EventParticipant[]>([]);

  const activeEvent = events.find(event => event.id === activeEventId) || events[0];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEvents = await apiService.getEvents();
      setEvents(fetchedEvents);
      if (fetchedEvents.length > 0) {
        setActiveEventId(fetchedEvents[0].id);
      }
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Load participants when active event changes
  useEffect(() => {
    const loadParticipants = async () => {
      if (activeEvent?.id) {
        try {
          const eventParticipants = await apiService.getEventParticipants(activeEvent.id);
          setParticipants(eventParticipants);
        } catch (error) {
          console.error('Failed to load participants:', error);
          setParticipants([]);
        }
      } else {
        setParticipants([]);
      }
    };

    loadParticipants();
  }, [activeEvent?.id]);

  const handleSaveData = async (updatedEvent: Event) => {
    try {
      const savedEvent = await apiService.updateEvent(updatedEvent);
      setEvents(events.map(event => event.id === savedEvent.id ? savedEvent : event));
      setEditSidebarOpen(false);
    } catch (error) {
      setError('Failed to save event. Please try again.');
    }
  };

  const handleNewEvent = async () => {
    const newEventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> = {
      name: 'New Event',
      date: new Date().toISOString(),
      location: '',
      status: 'upcoming',
      players: [],
      playerCount: 0,
      playerFee: 0,
      playerGroup1Name: 'Members',
      playerCount2: 0,
      playerFee2: 0,
      playerGroup2Name: 'Guests',
      levy1Name: 'Leicestershire',
      levy1Value: 0,
      levy2Name: 'Regional',
      levy2Value: 0,
      courseFee: 0,
      cashInBank: 0,
      funds: { bankTransfer: 0, cash: 0, card: 0 },
      surplus: 0,
      notes: ''
    };

    try {
      const newEvent = await apiService.createEvent(newEventData);
      setEvents([...events, newEvent]);
      setActiveEventId(newEvent.id);
      setEditSidebarOpen(true);
    } catch (error) {
      setError('Failed to create event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiService.deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      if (activeEventId === eventId) {
        const nextEvent = events.find(e => e.id !== eventId);
        setActiveEventId(nextEvent ? nextEvent.id : null);
      }
    } catch (error) {
      setError('Failed to delete event. Please try again.');
    }
  };

  const handleCompleteEvent = async () => {
    if (activeEvent && activeEvent.status !== 'completed') {
      try {
        const updatedEvent = { ...activeEvent, status: 'completed' as const };
        await apiService.updateEvent(updatedEvent);
        setEvents(events.map(event => 
          event.id === activeEvent.id ? updatedEvent : event
        ));
      } catch (error) {
        setError('Failed to complete event. Please try again.');
      }
    }
  };

  // Clean up events older than 30 days
  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setEvents(prevEvents => 
      prevEvents.filter(event => 
        !event.deletedAt || new Date(event.deletedAt) > thirtyDaysAgo
      )
    );
  }, []);

  // Filter out deleted events for display
  const visibleEvents = events.filter(event => !event.deletedAt);
  
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const totalFunds = (activeEvent && activeEvent.funds) ? 
    (activeEvent.funds.bankTransfer || 0) + (activeEvent.funds.cash || 0) + (activeEvent.funds.card || 0) : 0;

  // Calculate stats for the stats bar
  const totalEvents = visibleEvents.length;
  const totalRevenue = visibleEvents.reduce((sum, event) => {
    const income1 = (event.playerFee || 0) * (event.playerCount || 0);
    const income2 = (event.playerFee2 || 0) * (event.playerCount2 || 0);
    return sum + income1 + income2;
  }, 0);
  const averageSurplus = visibleEvents.length > 0 ? 
    visibleEvents.reduce((sum, event) => sum + (event.surplus || 0), 0) / visibleEvents.length : 0;
  const upcomingEvents = visibleEvents.filter(e => e.status === 'upcoming').length;

  return (
    <StyledThemeProvider theme={theme}>
      <DashboardContainer>
        <Sidebar>
          <SidebarTitle>Welcome, {user.username}</SidebarTitle>
          
          {/* Navigation Section - Admin Only */}
          {user.role === 'admin' && (
            <EventsSection>
              <EventsSectionTitle>Navigation</EventsSectionTitle>
              <SidebarButton 
                active={currentView === 'events'}
                onClick={() => setCurrentView('events')}
              >
                <Calendar size={18} /> Events
              </SidebarButton>
              <SidebarButton 
                active={currentView === 'members'}
                onClick={() => setCurrentView('members')}
              >
                <Users size={18} /> Members
              </SidebarButton>
            </EventsSection>
          )}
          
          {/* Events Navigation - Only show when in events view */}
          {currentView === 'events' && (
            <>
              <EventsSection>
                <EventsSectionTitle>In Progress</EventsSectionTitle>
            {visibleEvents.filter(e => e.status === 'in-progress').map(event => (
              <SidebarButton 
                key={event.id} 
                active={event.id === activeEventId}
                onClick={() => setActiveEventId(event.id)}
              >
                {event.name}
              </SidebarButton>
            ))}
          </EventsSection>

          <EventsSection>
            <EventsSectionTitle>Upcoming</EventsSectionTitle>
            {visibleEvents.filter(e => e.status === 'upcoming').map(event => (
              <SidebarButton 
                key={event.id} 
                active={event.id === activeEventId}
                onClick={() => setActiveEventId(event.id)}
              >
                {event.name}
              </SidebarButton>
            ))}
          </EventsSection>

          <EventsSection>
            <EventsSectionTitle>Completed</EventsSectionTitle>
            {visibleEvents.filter(e => e.status === 'completed').map(event => (
              <SidebarButton 
                key={event.id} 
                active={event.id === activeEventId}
                onClick={() => setActiveEventId(event.id)}
              >
                {event.name}
              </SidebarButton>
            ))}
          </EventsSection>
          
              {user.role === 'admin' && currentView === 'events' && (
                <SidebarButton onClick={handleNewEvent}>
                  <Plus size={18} /> New Event
                </SidebarButton>
              )}
            </>
          )}
          
          <SidebarButton onClick={onLogout}>
            <LogOut size={18} /> Log Out
          </SidebarButton>
        </Sidebar>

        <Content>
          {/* Members View - Admin Only */}
          {currentView === 'members' && user.role === 'admin' ? (
            <MembersList user={user} />
          ) : (
            /* Events View - Default */
            <>
              <Header>
                <Title>The Golf Society Dashboard</Title>
                <Subtitle>{user.role === 'admin' ? 'Manage your golf events, players, and finances' : 'View golf events, players, and finances'}</Subtitle>
              </Header>

              {error && (
                <ErrorContainer>
                  {error}
                </ErrorContainer>
              )}

              {!loading && events.length > 0 && (
                <>
                  <StatsBar>
                    <StatCard>
                      <StatNumber>{totalEvents}</StatNumber>
                      <StatCardLabel>Total Events</StatCardLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>£{totalRevenue.toFixed(0)}</StatNumber>
                      <StatCardLabel>Total Revenue</StatCardLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>£{averageSurplus.toFixed(0)}</StatNumber>
                      <StatCardLabel>Avg Surplus</StatCardLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{upcomingEvents}</StatNumber>
                      <StatCardLabel>Upcoming Events</StatCardLabel>
                    </StatCard>
                  </StatsBar>
                  
                  <ActionsContainer>
                    <ActionButton onClick={toggleTheme}>
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </ActionButton>
                    <ActionButton onClick={() => exportToCSV(visibleEvents)}>
                      <Download size={16} /> Export CSV
                    </ActionButton>
                    <ActionButton onClick={() => exportToPDF(visibleEvents)}>
                      <FileText size={16} /> Export PDF
                    </ActionButton>
                  </ActionsContainer>
                </>
              )}

              {loading ? (
                <LoadingContainer>
                  Loading events...
                </LoadingContainer>
              ) : activeEvent && activeEvent.id ? (
                <Grid>
              <Card>
                <CardHeader>
                  <CardTitle>Current Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventInfo>
                    <EventDetail>
                      <EventLabel>Event:</EventLabel>
                      <EventValue>{activeEvent.name}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Location:</EventLabel>
                      <EventValue>{activeEvent.location || 'TBD'}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Status:</EventLabel>
                      <EventValue>{activeEvent.status}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Total Players:</EventLabel>
                      <EventValue>{(activeEvent.playerCount || 0) + (activeEvent.playerCount2 || 0)}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Date:</EventLabel>
                      <EventValue>{formatDateBritish(activeEvent.date)}</EventValue>
                    </EventDetail>
                  </EventInfo>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{activeEvent?.playerGroup1Name || 'Group 1'} Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventInfo>
                    <EventDetail>
                      <EventLabel>Player Fee:</EventLabel>
                      <EventValue>£{(activeEvent?.playerFee || 0).toFixed(2)}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Total Players:</EventLabel>
                      <EventValue>{activeEvent?.playerCount || 0}</EventValue>
                    </EventDetail>
                    <EventDetail style={{ 
                      borderTop: '1px solid #e5e7eb', 
                      paddingTop: '12px', 
                      marginTop: '8px',
                      fontWeight: '600'
                    }}>
                      <EventLabel style={{ fontWeight: '600' }}>Group Income:</EventLabel>
                      <EventValue style={{ fontSize: '18px', color: '#059669' }}>£{((activeEvent?.playerFee || 0) * (activeEvent?.playerCount || 0)).toFixed(2)}</EventValue>
                    </EventDetail>
                  </EventInfo>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{activeEvent?.playerGroup2Name || 'Group 2'} Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventInfo>
                    <EventDetail>
                      <EventLabel>Player Fee:</EventLabel>
                      <EventValue>£{(activeEvent?.playerFee2 || 0).toFixed(2)}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Total Players:</EventLabel>
                      <EventValue>{activeEvent?.playerCount2 || 0}</EventValue>
                    </EventDetail>
                    <EventDetail style={{ 
                      borderTop: '1px solid #e5e7eb', 
                      paddingTop: '12px', 
                      marginTop: '8px',
                      fontWeight: '600'
                    }}>
                      <EventLabel style={{ fontWeight: '600' }}>Group Income:</EventLabel>
                      <EventValue style={{ fontSize: '18px', color: '#059669' }}>£{((activeEvent?.playerFee2 || 0) * (activeEvent?.playerCount2 || 0)).toFixed(2)}</EventValue>
                    </EventDetail>
                  </EventInfo>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundsList>
                    <FundItem>
                      <FundLabel>Bank Transfer</FundLabel>
                      <FundAmount>£{(activeEvent.funds?.bankTransfer || 0).toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Cash</FundLabel>
                      <FundAmount>£{(activeEvent.funds?.cash || 0).toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Card</FundLabel>
                      <FundAmount>£{(activeEvent.funds?.card || 0).toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Total</FundLabel>
                      <FundAmount>£{totalFunds.toFixed(2)}</FundAmount>
                    </FundItem>
                  </FundsList>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cash in Bank</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatValue>£{(activeEvent.cashInBank || 0).toFixed(2)}</StatValue>
                  <StatLabel>as per {formatDateBritish(activeEvent.date)}</StatLabel>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Levy</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundsList>
                    <FundItem>
                      <FundLabel>{activeEvent.levy1Name || 'Leicestershire'}</FundLabel>
                      <FundAmount>£{(activeEvent.levy1Value || 0).toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>{activeEvent.levy2Name || 'Regional'}</FundLabel>
                      <FundAmount>£{(activeEvent.levy2Value || 0).toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Total Levy</FundLabel>
                      <FundAmount>£{((activeEvent.levy1Value || 0) + (activeEvent.levy2Value || 0)).toFixed(2)}</FundAmount>
                    </FundItem>
                  </FundsList>
                </CardContent>
              </Card>

              <SurplusCard>
                <SurplusHeader>
                  <SurplusTitle>Surplus Funds on the day</SurplusTitle>
                </SurplusHeader>
                <CardContent>
                  <SurplusValue>£{(() => {
                    const playerIncome1 = (activeEvent?.playerFee || 0) * (activeEvent?.playerCount || 0);
                    const playerIncome2 = (activeEvent?.playerFee2 || 0) * (activeEvent?.playerCount2 || 0);
                    const totalPlayerIncome = playerIncome1 + playerIncome2;
                    const courseFee = activeEvent?.courseFee || 0;
                    return (totalPlayerIncome - courseFee).toFixed(2);
                  })()}</SurplusValue>
                  <StatLabel style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Player Income - Course Fee</StatLabel>
                </CardContent>
              </SurplusCard>

              <NotesCard>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <NotesText>{activeEvent.notes}</NotesText>
                </CardContent>
              </NotesCard>

              {participants.length > 0 && (
                <ParticipantsCard>
                  <CardHeader>
                    <CardTitle>Event Participants ({participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Participants Summary */}
                    <ParticipantsSummary>
                      <SummaryItem>
                        <SummaryNumber>{participants.length}</SummaryNumber>
                        <SummaryLabel>Total</SummaryLabel>
                      </SummaryItem>
                      <SummaryItem>
                        <SummaryNumber>{participants.filter(p => p.paymentStatus === 'paid').length}</SummaryNumber>
                        <SummaryLabel>Paid</SummaryLabel>
                      </SummaryItem>
                      <SummaryItem>
                        <SummaryNumber>{participants.filter(p => p.paymentStatus === 'unpaid').length}</SummaryNumber>
                        <SummaryLabel>Unpaid</SummaryLabel>
                      </SummaryItem>
                    </ParticipantsSummary>

                    {/* Participants List */}
                    <ParticipantsList>
                      {participants.map((participant) => (
                        <ParticipantItem key={participant.id}>
                          <ParticipantInfo>
                            <ParticipantName>{participant.member?.name || 'Unknown'}</ParticipantName>
                            <ParticipantDetails>
                              {participant.memberGroup && (
                                <ParticipantBadge variant="group">
                                  {participant.memberGroup}
                                </ParticipantBadge>
                              )}
                              {participant.member?.handicap && (
                                <ParticipantBadge variant="handicap">
                                  HCP: {participant.member.handicap}
                                </ParticipantBadge>
                              )}
                            </ParticipantDetails>
                          </ParticipantInfo>
                          <PaymentStatus isPaid={participant.paymentStatus === 'paid'}>
                            <PaymentIndicator isPaid={participant.paymentStatus === 'paid'} />
                            {participant.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </PaymentStatus>
                        </ParticipantItem>
                      ))}
                    </ParticipantsList>
                  </CardContent>
                </ParticipantsCard>
              )}
            </Grid>
          ) : !loading && events.length === 0 ? (
            <LoadingContainer>
              No events found. {user.role === 'admin' ? 'Create your first event using the + button.' : 'Please contact an admin to create events.'}
            </LoadingContainer>
          ) : null}
            </>
          )}
        </Content>
      </DashboardContainer>
      
      {user.role === 'admin' && activeEvent && (activeEvent.status === 'upcoming' || activeEvent.status === 'in-progress') && (
        <CompleteEventButton 
          theme={theme}
          onClick={handleCompleteEvent}
          title="Mark Event as Complete"
        >
          <CheckCircle size={20} />
        </CompleteEventButton>
      )}
      
      {user.role === 'admin' && (
        <FloatingActionButton theme={theme} onClick={() => setEditSidebarOpen(true)}>
          <PenTool size={20} />
        </FloatingActionButton>
      )}
      
      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        event={activeEvent}
        onSave={handleSaveData}
        onDelete={handleDeleteEvent}
      />
    </StyledThemeProvider>
  );
};

export default Dashboard;
