import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Trash2 } from 'lucide-react';
import { Event } from '../types';

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
  onDelete?: (eventId: string) => void;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete
}) => {
const [eventData, setEventData] = useState<Event | null>(event);

  // Update local state when event prop changes
  React.useEffect(() => {
    setEventData(event);
  }, [event]);

  // Auto-calculate surplus whenever playerFee, playerCount, or courseFee changes
  React.useEffect(() => {
    if (eventData) {
      const playerIncome = (eventData.playerFee || 0) * (eventData.playerCount || 0);
      const courseFee = eventData.courseFee || 0;
      const calculatedSurplus = playerIncome - courseFee;
      
      // Only update if the calculated surplus is different from the current one
      if (Math.abs(calculatedSurplus - (eventData.surplus || 0)) > 0.001) {
        setEventData(prev => prev ? { ...prev, surplus: calculatedSurplus } : null);
      }
    }
  }, [eventData?.playerFee, eventData?.playerCount, eventData?.courseFee]);

  const handleSave = () => {
    if (eventData) {
      onSave(eventData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (eventData && onDelete && window.confirm('Are you sure you want to delete this event? It will be kept for 30 days before being permanently removed.')) {
      onDelete(eventData.id);
      onClose();
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
            <SectionTitle>Event Details</SectionTitle>
            <Input
              placeholder="Event name"
              value={eventData.name}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
              style={{ marginBottom: '10px' }}
            />
            <Input
              type="date"
              placeholder="Event date"
              value={eventData.date ? eventData.date.split('T')[0] : ''}
              onChange={(e) => setEventData({ ...eventData, date: new Date(e.target.value).toISOString() })}
              style={{ marginBottom: '10px' }}
            />
            <Input
              placeholder="Event location"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              style={{ marginBottom: '10px' }}
            />
            <select
              value={eventData.status}
              onChange={(e) => setEventData({ ...eventData, status: e.target.value as 'upcoming' | 'in-progress' | 'completed' })}
              style={{
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '14px',
                width: '100%'
              }}
            >
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </Section>

          <Section>
            <SectionTitle>Player Information</SectionTitle>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Player Fee</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.playerFee || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ ...eventData, playerFee: value === '' ? 0 : Number(value) });
                  }
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Total Players</label>
              <Input
                type="text"
                placeholder="Number of players"
                value={String(eventData.playerCount || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setEventData({ ...eventData, playerCount: value === '' ? 0 : Number(value) });
                  }
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Course Fee</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.courseFee || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ ...eventData, courseFee: value === '' ? 0 : Number(value) });
                  }
                }}
              />
            </div>
          </Section>

          <Section>
            <SectionTitle>Cash in Bank</SectionTitle>
            <Input
              type="text"
              placeholder="0.00"
              value={String(eventData.cashInBank || 0)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setEventData({ ...eventData, cashInBank: value === '' ? 0 : Number(value) });
                }
              }}
            />
          </Section>

          <Section>
            <SectionTitle>Payments</SectionTitle>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Bank Transfer</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.funds.bankTransfer || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ 
                      ...eventData, 
                      funds: { ...eventData.funds, bankTransfer: value === '' ? 0 : Number(value) }
                    });
                  }
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Cash</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.funds.cash || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ 
                      ...eventData, 
                      funds: { ...eventData.funds, cash: value === '' ? 0 : Number(value) }
                    });
                  }
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Card</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.funds.card || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ 
                      ...eventData, 
                      funds: { ...eventData.funds, card: value === '' ? 0 : Number(value) }
                    });
                  }
                }}
              />
            </div>
          </Section>

          <Section>
            <SectionTitle>Surplus (Auto-calculated)</SectionTitle>
            <Input
              type="text"
              placeholder="Surplus amount"
              value={parseFloat(eventData.surplus || 0).toFixed(2)}
              readOnly
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Player Income - Course Fee = £{parseFloat((eventData.playerFee || 0) * (eventData.playerCount || 0)).toFixed(2)} - £{parseFloat(eventData.courseFee || 0).toFixed(2)}
            </small>
          </Section>

          <Section>
            <SectionTitle>Notes</SectionTitle>
            <TextArea
              placeholder="Enter notes..."
              value={eventData.notes}
              onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
            />
          </Section>

          {onDelete && (
            <Button variant="danger" onClick={handleDelete} style={{ marginBottom: '10px', width: '100%' }}>
              <Trash2 size={16} />
              Delete Event
            </Button>
          )}
          
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
