import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, Trash2, Plus, User } from 'lucide-react';
import { Event, Member, EventParticipant } from '../types';
import { apiService } from '../services/api';

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

const MemberSelect = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f9fafb;
`;

const MemberSelectHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const MemberName = styled.span`
  font-weight: 500;
  color: #374151;
`;

const MemberGroup = styled.span`
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
`;

const PaymentCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin-left: 10px;
  cursor: pointer;
`;

const RemoveMemberButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #dc2626;
  }
`;

const AddMemberButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #059669;
  }
`;

const MemberSelectDropdown = styled.select`
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 200px;
  
  &:focus {
    border-color: #2a5298;
  }
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
  const [members, setMembers] = useState<Member[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');

  // Update local state when event prop changes
  React.useEffect(() => {
    setEventData(event);
  }, [event]);

  // Auto-calculate surplus using useMemo for better performance and reliability
  const calculatedSurplus = React.useMemo(() => {
    if (!eventData) return 0;
    const playerIncome1 = (eventData.playerFee || 0) * (eventData.playerCount || 0);
    const playerIncome2 = (eventData.playerFee2 || 0) * (eventData.playerCount2 || 0);
    const totalPlayerIncome = playerIncome1 + playerIncome2;
    const courseFee = eventData.courseFee || 0;
    return totalPlayerIncome - courseFee;
  }, [eventData?.playerFee, eventData?.playerCount, eventData?.playerFee2, eventData?.playerCount2, eventData?.courseFee]);

  // Update eventData when calculatedSurplus changes
  React.useEffect(() => {
    if (eventData && calculatedSurplus !== eventData.surplus) {
      setEventData(prev => prev ? { ...prev, surplus: calculatedSurplus } : null);
    }
  }, [calculatedSurplus, eventData?.surplus]);

  // Load members when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        try {
          const membersList = await apiService.getMembers();
          setMembers(membersList);
        } catch (error) {
          console.error('Failed to load members:', error);
        }
      };
      fetchMembers();
    }
  }, [isOpen]);

  // Load participants when event changes
  useEffect(() => {
    if (eventData?.id) {
      const fetchParticipants = async () => {
        try {
          const participantsList = await apiService.getEventParticipants(eventData.id);
          setParticipants(participantsList);
        } catch (error) {
          console.error('Failed to load participants:', error);
          setParticipants([]);
        }
      };
      fetchParticipants();
    }
  }, [eventData?.id]);

  const handleAddMember = async () => {
    if (!selectedMember || !eventData) return;
    
    const member = members.find(m => m.id === selectedMember);
    if (!member) return;

    // Check if member is already added
    if (participants.some(p => p.memberId === selectedMember)) {
      alert('Member is already added to this event');
      return;
    }

    try {
      const newParticipant: Omit<EventParticipant, 'id' | 'createdAt' | 'updatedAt'> = {
        eventId: eventData.id,
        memberId: selectedMember,
        memberGroup: 'members', // Default to members group
        paymentStatus: 'unpaid',
        playerFee: eventData.playerFee || 0
      };

      const savedParticipant = await apiService.createEventParticipant(newParticipant);
      setParticipants([...participants, savedParticipant]);
      setSelectedMember('');
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member to event');
    }
  };

  const handleRemoveMember = async (participantId: string) => {
    try {
      await apiService.deleteEventParticipant(participantId);
      setParticipants(participants.filter(p => p.id !== participantId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member from event');
    }
  };

  const handlePaymentStatusChange = async (participantId: string, isPaid: boolean) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      const updatedParticipant = {
        ...participant,
        paymentStatus: isPaid ? 'paid' as const : 'unpaid' as const
      };

      const savedParticipant = await apiService.updateEventParticipant(updatedParticipant);
      setParticipants(participants.map(p => 
        p.id === participantId ? savedParticipant : p
      ));
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    }
  };

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
            <SectionTitle><User size={20} style={{ display: 'inline', marginRight: '8px' }} />Event Participants</SectionTitle>
            <MemberSelect>
              <MemberSelectHeader>
                <MemberSelectDropdown
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Select a member...</option>
                  {members
                    .filter(member => !participants.some(p => p.memberId === member.id))
                    .map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.handicap ? `(${member.handicap})` : ''}
                    </option>
                  ))}
                </MemberSelectDropdown>
                <AddMemberButton 
                  onClick={handleAddMember}
                  disabled={!selectedMember}
                >
                  <Plus size={16} /> Add
                </AddMemberButton>
              </MemberSelectHeader>
              
              {participants.map(participant => {
                const member = members.find(m => m.id === participant.memberId);
                if (!member) return null;
                
                return (
                  <MemberItem key={participant.id}>
                    <MemberInfo>
                      <MemberName>{member.name}</MemberName>
                      <MemberGroup>{participant.memberGroup}</MemberGroup>
                      {member.handicap && (
                        <MemberGroup>H{member.handicap}</MemberGroup>
                      )}
                    </MemberInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>Paid:</label>
                      <PaymentCheckbox
                        type="checkbox"
                        checked={participant.paymentStatus === 'paid'}
                        onChange={(e) => handlePaymentStatusChange(participant.id, e.target.checked)}
                      />
                      <RemoveMemberButton
                        onClick={() => handleRemoveMember(participant.id)}
                      >
                        ×
                      </RemoveMemberButton>
                    </div>
                  </MemberItem>
                );
              })}
              
              {participants.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  padding: '20px 10px' 
                }}>
                  No participants selected. Choose members from the dropdown above.
                </div>
              )}
            </MemberSelect>
            
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
              Total participants: {participants.length} | 
              Paid: {participants.filter(p => p.paymentStatus === 'paid').length} | 
              Unpaid: {participants.filter(p => p.paymentStatus === 'unpaid').length}
            </div>
          </Section>

          <Section>
            <SectionTitle>Player Information - {eventData.playerGroup1Name || 'Group 1'}</SectionTitle>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Group Name</label>
              <Input
                type="text"
                placeholder="Group 1 Name"
                value={eventData.playerGroup1Name || 'Members'}
                onChange={(e) => setEventData({ ...eventData, playerGroup1Name: e.target.value })}
              />
            </div>
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
          </Section>

          <Section>
            <SectionTitle>Player Information - {eventData.playerGroup2Name || 'Group 2'}</SectionTitle>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Group Name</label>
              <Input
                type="text"
                placeholder="Group 2 Name"
                value={eventData.playerGroup2Name || 'Guests'}
                onChange={(e) => setEventData({ ...eventData, playerGroup2Name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Player Fee (Group 2)</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.playerFee2 || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ ...eventData, playerFee2: value === '' ? 0 : Number(value) });
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
              }}>Total Players (Group 2)</label>
              <Input
                type="text"
                placeholder="Number of players"
                value={String(eventData.playerCount2 || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setEventData({ ...eventData, playerCount2: value === '' ? 0 : Number(value) });
                  }
                }}
              />
            </div>
          </Section>

          <Section>
            <SectionTitle>Course Information</SectionTitle>
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
            <SectionTitle>Levy</SectionTitle>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Levy 1 Name</label>
              <Input
                type="text"
                placeholder="Leicestershire"
                value={eventData.levy1Name || 'Leicestershire'}
                onChange={(e) => setEventData({ ...eventData, levy1Name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Levy 1 Value</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.levy1Value || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ ...eventData, levy1Value: value === '' ? 0 : Number(value) });
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
              }}>Levy 2 Name</label>
              <Input
                type="text"
                placeholder="Regional"
                value={eventData.levy2Name || 'Regional'}
                onChange={(e) => setEventData({ ...eventData, levy2Name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#555', 
                marginBottom: '5px' 
              }}>Levy 2 Value</label>
              <Input
                type="text"
                placeholder="0.00"
                value={String(eventData.levy2Value || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEventData({ ...eventData, levy2Value: value === '' ? 0 : Number(value) });
                  }
                }}
              />
            </div>
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
              value={Number(eventData.surplus || 0).toFixed(2)}
              readOnly
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Total Player Income - Course Fee = £{Number(((eventData.playerFee || 0) * (eventData.playerCount || 0)) + ((eventData.playerFee2 || 0) * (eventData.playerCount2 || 0))).toFixed(2)} - £{Number(eventData.courseFee || 0).toFixed(2)}
              <br />
              Group 1: £{Number((eventData.playerFee || 0) * (eventData.playerCount || 0)).toFixed(2)} | Group 2: £{Number((eventData.playerFee2 || 0) * (eventData.playerCount2 || 0)).toFixed(2)}
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
