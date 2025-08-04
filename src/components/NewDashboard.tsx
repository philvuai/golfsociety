import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { LogOut, Plus, PenTool, CheckCircle } from 'lucide-react';
import EditSidebar from './EditSidebar';
import { Event } from '../types';
import { formatDateBritish } from '../utils/dateUtils';
import { apiService } from '../services/api';

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

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const StatCardLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const CompleteEventButton = styled.button`
  position: fixed;
  bottom: 96px;
  right: 24px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #047857;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(5, 150, 105, 0.4);
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
          
          {user.role === 'admin' && (
            <SidebarButton onClick={handleNewEvent}>
              <Plus size={18} /> New Event
            </SidebarButton>
          )}
          <SidebarButton onClick={onLogout}>
            <LogOut size={18} /> Log Out
          </SidebarButton>
        </Sidebar>

        <Content>
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
            </Grid>
          ) : !loading && events.length === 0 ? (
            <LoadingContainer>
              No events found. {user.role === 'admin' ? 'Create your first event using the + button.' : 'Please contact an admin to create events.'}
            </LoadingContainer>
          ) : null}
        </Content>
      </DashboardContainer>
      
      {user.role === 'admin' && activeEvent && (activeEvent.status === 'upcoming' || activeEvent.status === 'in-progress') && (
        <CompleteEventButton 
          onClick={handleCompleteEvent}
          title="Mark Event as Complete"
        >
          <CheckCircle size={20} />
        </CompleteEventButton>
      )}
      
      {user.role === 'admin' && (
        <FloatingActionButton onClick={() => setEditSidebarOpen(true)}>
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
    </>
  );
};

export default Dashboard;
