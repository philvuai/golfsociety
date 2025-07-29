import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Player, Event, Funds } from '../types';

const SidebarOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1001;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  background: #1e3c72;
  color: white;
`;

const SidebarTitle = styled.h2`
  font-size: 20px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  color: white;
  padding: 5px;
  border-radius: 5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SidebarContent = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
`;


const Input = styled.input`
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    border-color: #2a5298;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    border-color: #2a5298;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => 
    props.variant === 'danger' ? '#e74c3c' : 
    props.variant === 'primary' ? '#2a5298' : '#f8f9fa'};
  color: ${props => 
    props.variant === 'danger' || props.variant === 'primary' ? 'white' : '#333'};
  border: ${props => 
    props.variant === 'danger' || props.variant === 'primary' ? 'none' : '1px solid #e1e5e9'};
  
  &:hover {
    opacity: 0.9;
  }
`;

const PlayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const SaveButton = styled(Button)`
  position: sticky;
  bottom: 20px;
  margin-top: 20px;
`;

interface EditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  currentEvent: Event | null;
  funds: Funds;
  surplus: number;
  notes: string;
  onSave: (data: {
    players: Player[];
    currentEvent: Event | null;
    funds: Funds;
    surplus: number;
    notes: string;
  }) => void;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
  isOpen,
  onClose,
  players: initialPlayers,
  currentEvent: initialEvent,
  funds: initialFunds,
  surplus: initialSurplus,
  notes: initialNotes,
  onSave
}) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(initialEvent);
  const [funds, setFunds] = useState<Funds>(initialFunds);
  const [surplus, setSurplus] = useState(initialSurplus);
  const [notes, setNotes] = useState(initialNotes);
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        joinedDate: new Date().toISOString()
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const handleSave = () => {
    onSave({
      players,
      currentEvent,
      funds,
      surplus,
      notes
    });
    onClose();
  };

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <SidebarTitle>Edit Dashboard</SidebarTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </SidebarHeader>
        
        <SidebarContent>
          <Section>
            <SectionTitle>Players</SectionTitle>
            {players.map(player => (
              <PlayerItem key={player.id}>
                <span>{player.name}</span>
                <Button 
                  variant="danger" 
                  onClick={() => handleRemovePlayer(player.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </PlayerItem>
            ))}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Input
                placeholder="New player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              />
              <Button onClick={handleAddPlayer}>
                <Plus size={16} />
              </Button>
            </div>
          </Section>

          <Section>
            <SectionTitle>Current Event</SectionTitle>
            <Input
              placeholder="Event name"
              value={currentEvent?.name || ''}
              onChange={(e) => setCurrentEvent(currentEvent ? 
                { ...currentEvent, name: e.target.value } : 
                {
                  id: Date.now().toString(),
                  name: e.target.value,
                  date: new Date().toISOString(),
                  location: '',
                  status: 'upcoming',
                  players: []
                }
              )}
            />
            <Input
              placeholder="Event location"
              value={currentEvent?.location || ''}
              onChange={(e) => setCurrentEvent(currentEvent ? 
                { ...currentEvent, location: e.target.value } : null
              )}
            />
          </Section>

          <Section>
            <SectionTitle>Funds</SectionTitle>
            <Input
              type="number"
              placeholder="Bank Transfer"
              value={funds.bankTransfer}
              onChange={(e) => setFunds({ ...funds, bankTransfer: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Cash"
              value={funds.cash}
              onChange={(e) => setFunds({ ...funds, cash: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Card"
              value={funds.card}
              onChange={(e) => setFunds({ ...funds, card: Number(e.target.value) })}
            />
          </Section>

          <Section>
            <SectionTitle>Surplus</SectionTitle>
            <Input
              type="number"
              placeholder="Surplus amount"
              value={surplus}
              onChange={(e) => setSurplus(Number(e.target.value))}
            />
          </Section>

          <Section>
            <SectionTitle>Notes</SectionTitle>
            <TextArea
              placeholder="Enter notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Section>

          <SaveButton variant="primary" onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </SaveButton>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default EditSidebar;
