import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save } from 'lucide-react';
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


const SaveButton = styled(Button)`
  position: sticky;
  bottom: 20px;
  margin-top: 20px;
`;

interface EditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSave: (event: Event) => void;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
  isOpen,
  onClose,
  event,
  onSave
}) => {
  const [eventData, setEventData] = useState<Event | null>(event);

  // Update local state when event prop changes
  React.useEffect(() => {
    setEventData(event);
  }, [event]);

  const handleSave = () => {
    if (eventData) {
      onSave(eventData);
    }
  };

  if (!eventData) return null;

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
            <SectionTitle>Player Count</SectionTitle>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                type="number"
                placeholder="Number of players"
                value={players.length}
                onChange={(e) => {
                  const count = Number(e.target.value) || 0;
                  if (count >= 0) {
                    const newPlayers = Array.from({ length: count }, (_, i) => ({
                      id: Date.now().toString() + i,
                      name: `Player ${i + 1}`,
                      joinedDate: new Date().toISOString()
                    }));
                    setPlayers(newPlayers);
                    if (currentEvent) {
                      setCurrentEvent({
                        ...currentEvent,
                        players: newPlayers.map(p => p.id)
                      });
                    }
                  }
                }}
                min="0"
              />
              <span style={{ color: '#6b7280', fontSize: '14px' }}>players</span>
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
