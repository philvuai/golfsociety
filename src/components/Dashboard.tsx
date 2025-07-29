import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Menu, LogOut, Plus, PenTool } from 'lucide-react';
import EditSidebar from './EditSidebar';
import { Player, Event, Funds } from '../types';

const DashboardContainer = styled.div`
  display: flex;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #1e3c72;
  color: white;
  padding: 20px;
`;

const SidebarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 40px;
  background: #f4f6f8;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 32px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #2a5298;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;

  &:hover {
    background: #1e3c72;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #666;
  font-size: 24px;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: white;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const FundsTotal = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
`;

const SurplusAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2a5298;
`;

const NotesText = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  line-height: 1.5;
`;

interface DashboardProps {
  user: { username: string; };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'John Smith', joinedDate: new Date().toISOString() },
    { id: '2', name: 'Mike Johnson', joinedDate: new Date().toISOString() },
    { id: '3', name: 'David Brown', joinedDate: new Date().toISOString() }
  ]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>({
    id: '1',
    name: 'Monthly Tournament',
    date: new Date().toISOString(),
    location: 'Hillside Golf Club',
    status: 'in-progress',
    players: ['1', '2', '3']
  });
  const [funds, setFunds] = useState<Funds>({ bankTransfer: 1000, cash: 500, card: 250 });
  const [surplus, setSurplus] = useState(200);
  const [notes, setNotes] = useState('Tournament registration is now open. Please confirm your attendance by Friday.');
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dashboardData = {
      players,
      currentEvent,
      funds,
      surplus,
      notes,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('golf-society-dashboard', JSON.stringify(dashboardData));
  }, [players, currentEvent, funds, surplus, notes]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('golf-society-dashboard');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setPlayers(data.players || []);
        setCurrentEvent(data.currentEvent || null);
        setFunds(data.funds || { bankTransfer: 0, cash: 0, card: 0 });
        setSurplus(data.surplus || 0);
        setNotes(data.notes || '');
      } catch (error) {
        console.error('Error loading saved dashboard data:', error);
      }
    }
  }, []);

  const totalFunds = funds.bankTransfer + funds.cash + funds.card;

  const handleSaveData = (data: {
    players: Player[];
    currentEvent: Event | null;
    funds: Funds;
    surplus: number;
    notes: string;
  }) => {
    setPlayers(data.players);
    setCurrentEvent(data.currentEvent);
    setFunds(data.funds);
    setSurplus(data.surplus);
    setNotes(data.notes);
  };

  return (
    <>
      <DashboardContainer>
        <Sidebar>
          <h2>{user.username}</h2>
          <SidebarButton onClick={onLogout}>
            <LogOut size={20} /> Log Out
          </SidebarButton>
          <SidebarButton>
            <Plus size={20} /> New Event
          </SidebarButton>
          <SidebarButton onClick={() => setEditSidebarOpen(true)}>
            <PenTool size={20} /> Edit Dashboard
          </SidebarButton>
        </Sidebar>

        <Content>
          <Header>
            <Title>The Golf Society Dashboard</Title>
            <ActionButton onClick={() => setEditSidebarOpen(true)}>
              <Menu size={20} /> Edit
            </ActionButton>
          </Header>

          <Section>
            <SectionTitle>Players ({players.length})</SectionTitle>
            <List>
              {players.map((player) => (
                <ListItem key={player.id}>{player.name}</ListItem>
              ))}
            </List>
          </Section>

          <Section>
            <SectionTitle>Current Event</SectionTitle>
            {currentEvent ? (
              <ListItem>
                <strong>{currentEvent.name}</strong><br />
                Location: {currentEvent.location}<br />
                Status: {currentEvent.status}<br />
                Date: {new Date(currentEvent.date).toLocaleDateString()}
              </ListItem>
            ) : (
              <ListItem>No current event</ListItem>
            )}
          </Section>

          <Section>
            <SectionTitle>Funds</SectionTitle>
            <List>
              <ListItem>Bank Transfer: £{funds.bankTransfer.toFixed(2)}</ListItem>
              <ListItem>Cash: £{funds.cash.toFixed(2)}</ListItem>
              <ListItem>Card: £{funds.card.toFixed(2)}</ListItem>
              <FundsTotal>Total: £{totalFunds.toFixed(2)}</FundsTotal>
            </List>
          </Section>

          <Section>
            <SectionTitle>Surplus Funds</SectionTitle>
            <SurplusAmount>£{surplus.toFixed(2)}</SurplusAmount>
          </Section>

          <Section>
            <SectionTitle>Notes</SectionTitle>
            <NotesText>{notes}</NotesText>
          </Section>
        </Content>
      </DashboardContainer>
      
      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        players={players}
        currentEvent={currentEvent}
        funds={funds}
        surplus={surplus}
        notes={notes}
        onSave={handleSaveData}
      />
    </>
  );
}

export default Dashboard;

