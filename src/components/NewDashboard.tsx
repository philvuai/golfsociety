import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LogOut, Plus, PenTool } from 'lucide-react';
import EditSidebar from './EditSidebar';
import { Event } from '../types';

const DashboardContainer = styled.div`
  display: flex;
  background: #f8fafc;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #1f2937;
  color: white;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid #374151;
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #f9fafb;
`;

const SidebarButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: ${props => props.active ? '#4b5563' : '#374151'};
  color: ${props => props.active ? '#f9fafb' : '#d1d5db'};
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: left;

  &:hover {
    background: #4b5563;
    color: #f9fafb;
  }
`;

const EventsSection = styled.div`
  margin-bottom: 16px;
`;

const EventsSectionTitle = styled.h3`
  color: #9ca3af;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const Content = styled.div`
  flex: 1;
  padding: 32px;
  background: #f8fafc;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: #111827;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
`;

const CardTitle = styled.h3`
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 20px 24px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
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
  color: #6b7280;
  font-weight: 500;
`;

const EventValue = styled.span`
  color: #111827;
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
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
    font-weight: 600;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }
`;

const FundLabel = styled.span`
  color: #6b7280;
  font-size: 14px;
`;

const FundAmount = styled.span`
  color: #111827;
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

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
  }
`;

interface DashboardProps {
  user: { username: string; };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Monthly Tournament',
      date: new Date().toISOString(),
      location: 'Hillside Golf Club',
      status: 'in-progress',
      players: ['1', '2', '3'],
      playerCount: 3,
      funds: { bankTransfer: 1000, cash: 500, card: 250 },
      surplus: 200,
      notes: 'Tournament registration is now open. Please confirm your attendance by Friday.'
    }
  ]);
  const [activeEventId, setActiveEventId] = useState<string>('1');
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);

  const activeEvent = events.find(event => event.id === activeEventId) || events[0];

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dashboardData = {
      events,
      activeEventId,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('golf-society-dashboard', JSON.stringify(dashboardData));
  }, [events, activeEventId]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('golf-society-dashboard');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
          setActiveEventId(data.activeEventId || data.events[0].id);
        }
      } catch (error) {
        console.error('Error loading saved dashboard data:', error);
      }
    }
  }, []);

  const handleSaveData = (updatedEvent: Event) => {
    setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
    setEditSidebarOpen(false);
  };

  const handleNewEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      name: 'New Event',
      date: new Date().toISOString(),
      location: '',
      status: 'upcoming',
      players: [],
      playerCount: 0,
      funds: { bankTransfer: 0, cash: 0, card: 0 },
      surplus: 0,
      notes: ''
    };
    setEvents([...events, newEvent]);
    setActiveEventId(newEvent.id);
    setEditSidebarOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, deletedAt: new Date().toISOString() } : event
    ));
    
    // Switch to another event if the active one is deleted
    if (activeEventId === eventId) {
      const nextEvent = events.find(e => e.id !== eventId && !e.deletedAt);
      setActiveEventId(nextEvent ? nextEvent.id : '1');
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
  
  const totalFunds = activeEvent ? 
    activeEvent.funds.bankTransfer + activeEvent.funds.cash + activeEvent.funds.card : 0;

  return (
    <>
      <DashboardContainer>
        <Sidebar>
          <SidebarTitle>Welcome, {user.username}</SidebarTitle>
          
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
          
          <SidebarButton onClick={handleNewEvent}>
            <Plus size={18} /> New Event
          </SidebarButton>
          <SidebarButton onClick={onLogout}>
            <LogOut size={18} /> Log Out
          </SidebarButton>
        </Sidebar>

        <Content>
          <Header>
            <Title>The Golf Society Dashboard</Title>
            <Subtitle>Manage your golf events, players, and finances</Subtitle>
          </Header>

          {activeEvent && (
            <Grid>
              <Card>
                <CardHeader>
                  <CardTitle>Total Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatValue>{activeEvent.playerCount}</StatValue>
                  <StatLabel>Active Members</StatLabel>
                </CardContent>
              </Card>

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
                      <EventLabel>Players:</EventLabel>
                      <EventValue>{activeEvent.playerCount}</EventValue>
                    </EventDetail>
                    <EventDetail>
                      <EventLabel>Date:</EventLabel>
                      <EventValue>{new Date(activeEvent.date).toLocaleDateString()}</EventValue>
                    </EventDetail>
                  </EventInfo>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundsList>
                    <FundItem>
                      <FundLabel>Bank Transfer</FundLabel>
                      <FundAmount>£{activeEvent.funds.bankTransfer.toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Cash</FundLabel>
                      <FundAmount>£{activeEvent.funds.cash.toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Card</FundLabel>
                      <FundAmount>£{activeEvent.funds.card.toFixed(2)}</FundAmount>
                    </FundItem>
                    <FundItem>
                      <FundLabel>Total</FundLabel>
                      <FundAmount>£{totalFunds.toFixed(2)}</FundAmount>
                    </FundItem>
                  </FundsList>
                </CardContent>
              </Card>

              <SurplusCard>
                <SurplusHeader>
                  <SurplusTitle>Surplus Funds</SurplusTitle>
                </SurplusHeader>
                <CardContent>
                  <SurplusValue>£{activeEvent.surplus.toFixed(2)}</SurplusValue>
                  <StatLabel style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Available Balance</StatLabel>
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
            </Grid>
          )}
        </Content>
      </DashboardContainer>
      
      <FloatingActionButton onClick={() => setEditSidebarOpen(true)}>
        <PenTool size={20} />
      </FloatingActionButton>
      
      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        event={activeEvent}
        onSave={handleSaveData}
        onDelete={handleDeleteEvent}
      />
    </>
  );
};

export default Dashboard;
