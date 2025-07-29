import React, { useState } from 'react';
import styled from 'styled-components';
import { Menu, LogOut, Plus, PenTool } from 'lucide-react';

const DashboardContainer = styled.div`
  display: flex;
  
`;

const Sidebar = styled.div`
  width: 250px;
  background: #1e3c72;
  color: white;
  padding: 20px;
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
  background: #2a5298;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;

  :hover {
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
`;

interface DashboardProps {
  user: { username: string; };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3']);
  const [events, setEvents] = useState(['Event 1', 'Event 2']);
  const [funds, setFunds] = useState({ bank: 1000, cash: 500, card: 250 });
  const [surplus, setSurplus] = useState(200);
  const [notes, setNotes] = useState('No recent notes.');

  const totalFunds = funds.bank + funds.cash + funds.card;

  return (
    <DashboardContainer>
      <Sidebar>
        <h2>{user.username}</h2>
        <button onClick={onLogout}><LogOut size={20} /> Log Out</button>
        <button><Plus size={20} /> New Event</button>
        <button><PenTool size={20} /> Edit Dashboard</button>
      </Sidebar>

      <Content>
        <Header>
          <Title>Dashboard</Title>
          <ActionButton><Menu size={20} /> Menu</ActionButton>
        </Header>

        <Section>
          <SectionTitle>Players</SectionTitle>
          <List>
            {players.map((player, index) => (
              <ListItem key={index}>{player}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Events</SectionTitle>
          <List>
            {events.map((event, index) => (
              <ListItem key={index}>{event}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Funds</SectionTitle>
          <List>
            <ListItem>Bank Transfer: ${funds.bank}</ListItem>
            <ListItem>Cash: ${funds.cash}</ListItem>
            <ListItem>Card: ${funds.card}</ListItem>
            <FundsTotal>Total: ${totalFunds}</FundsTotal>
          </List>
        </Section>

        <Section>
          <SectionTitle>Surplus</SectionTitle>
          <p>${surplus}</p>
        </Section>

        <Section>
          <SectionTitle>Notes</SectionTitle>
          <p>{notes}</p>
        </Section>
      </Content>
    </DashboardContainer>
  );
}

export default Dashboard;

