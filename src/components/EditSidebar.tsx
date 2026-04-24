import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { X, Save, Trash2, Plus, User } from 'lucide-react';
import { Event, Member, EventParticipant } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const SidebarOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${p => p.isOpen ? 1 : 0};
  visibility: ${p => p.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0; right: 0;
  width: 400px;
  height: 100vh;
  background: ${p => p.theme.colors.surfaceElevated};
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transform: translateX(${p => p.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1001;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${p => p.theme.colors.border.medium};
  background: ${p => p.theme.colors.sidebar.background};
  color: ${p => p.theme.colors.sidebar.text};
`;

const SidebarTitle = styled.h2`font-size: 20px; margin: 0;`;

const CloseButton = styled.button`
  background: none;
  color: inherit;
  padding: 5px;
  border-radius: 5px;
  &:hover { background: rgba(255, 255, 255, 0.1); }
  &::before { display: none; }
`;

const SidebarContent = styled.div`padding: 20px;`;
const Section = styled.div`margin-bottom: 30px;`;
const SectionTitle = styled.h3`
  color: ${p => p.theme.colors.text.primary};
  font-size: 18px;
  margin-bottom: 15px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.colors.text.secondary};
  margin-bottom: 5px;
`;

const FormGroup = styled.div`margin-bottom: 15px;`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid ${p => p.theme.colors.border.medium};
  border-radius: 8px;
  font-size: 14px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  &:focus { border-color: ${p => p.theme.colors.accent.primary}; outline: none; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid ${p => p.theme.colors.border.medium};
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  &:focus { border-color: ${p => p.theme.colors.accent.primary}; outline: none; }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid ${p => p.theme.colors.border.medium};
  border-radius: 8px;
  font-size: 14px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  &:focus { border-color: ${p => p.theme.colors.accent.primary}; outline: none; }
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
  width: 100%;
  background: ${p => p.variant === 'danger' ? p.theme.colors.status.error : p.variant === 'primary' ? p.theme.colors.accent.primary : p.theme.colors.surface};
  color: ${p => p.variant ? 'white' : p.theme.colors.text.primary};
  border: ${p => p.variant ? 'none' : `1px solid ${p.theme.colors.border.medium}`};
  &:hover { opacity: 0.9; }
`;

const SaveButton = styled(Button)`
  position: sticky;
  bottom: 20px;
  margin-top: 20px;
`;

const MemberSelectBox = styled.div`
  border: 2px solid ${p => p.theme.colors.border.medium};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: ${p => p.theme.colors.surface};
`;

const MemberSelectHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${p => p.theme.colors.surfaceElevated};
  border: 1px solid ${p => p.theme.colors.border.light};
  border-radius: 6px;
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
`;

const MemberInfo = styled.div`display: flex; align-items: center; gap: 10px; flex: 1;`;
const MemberName = styled.span`font-weight: 500; color: ${p => p.theme.colors.text.primary};`;
const MemberGroup = styled.span`
  font-size: 12px; color: ${p => p.theme.colors.text.secondary};
  background: ${p => p.theme.colors.surface}; padding: 2px 6px; border-radius: 4px;
`;

const PaymentCheckbox = styled.input`width: 18px; height: 18px; margin-left: 10px; cursor: pointer;`;

const RemoveBtn = styled.button`
  background: ${p => p.theme.colors.status.error};
  color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer;
  &:hover { opacity: 0.9; }
  &::before { display: none; }
`;

const AddBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: ${p => p.theme.colors.status.success};
  color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 14px; cursor: pointer;
  &:hover { opacity: 0.9; }
  &::before { display: none; }
`;

const SmallText = styled.div`
  font-size: 12px; color: ${p => p.theme.colors.text.tertiary}; margin-top: 5px;
`;

const EmptyText = styled.div`
  text-align: center; color: ${p => p.theme.colors.text.tertiary}; font-size: 14px; padding: 20px 10px;
`;

interface EditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

const EditSidebar: React.FC<EditSidebarProps> = ({ isOpen, onClose, event, onSave, onDelete }) => {
  const [eventData, setEventData] = useState<Event | null>(event);
  const [members, setMembers] = useState<Member[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const { showToast } = useToast();

  useEffect(() => { setEventData(event); }, [event]);

  const calculatedSurplus = useMemo(() => {
    if (!eventData) return 0;
    const i1 = (eventData.playerFee || 0) * (eventData.playerCount || 0);
    const i2 = (eventData.playerFee2 || 0) * (eventData.playerCount2 || 0);
    return i1 + i2 - (eventData.courseFee || 0);
  }, [eventData?.playerFee, eventData?.playerCount, eventData?.playerFee2, eventData?.playerCount2, eventData?.courseFee]);

  useEffect(() => {
    if (eventData && calculatedSurplus !== eventData.surplus) {
      setEventData(prev => prev ? { ...prev, surplus: calculatedSurplus } : null);
    }
  }, [calculatedSurplus]);

  useEffect(() => {
    if (isOpen) {
      apiService.getMembers().then(setMembers).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (eventData?.id) {
      apiService.getEventParticipants(eventData.id).then(setParticipants).catch(() => setParticipants([]));
    } else {
      setParticipants([]);
    }
  }, [eventData?.id]);

  const handleAddMember = async () => {
    if (!selectedMember || !eventData) return;
    if (participants.some(p => p.memberId === selectedMember)) {
      showToast('Member is already added to this event', 'info');
      return;
    }
    try {
      const saved = await apiService.createEventParticipant({
        eventId: eventData.id, memberId: selectedMember, memberGroup: 'members',
        paymentStatus: 'unpaid', playerFee: eventData.playerFee || 0
      });
      setParticipants(prev => [...prev, saved]);
      setSelectedMember('');
      showToast('Member added', 'success');
    } catch {
      showToast('Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (participantId: string) => {
    try {
      await apiService.deleteEventParticipant(participantId);
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      showToast('Member removed', 'success');
    } catch {
      showToast('Failed to remove member', 'error');
    }
  };

  const handlePaymentStatus = async (participantId: string, isPaid: boolean) => {
    try {
      const p = participants.find(x => x.id === participantId);
      if (!p) return;
      const saved = await apiService.updateEventParticipant({
        ...p, paymentStatus: isPaid ? 'paid' : 'unpaid'
      });
      setParticipants(prev => prev.map(x => x.id === participantId ? saved : x));
    } catch {
      showToast('Failed to update payment status', 'error');
    }
  };

  const handleSave = () => { if (eventData) { onSave(eventData); } };

  const handleDelete = () => {
    if (eventData && onDelete && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(eventData.id);
      onClose();
    }
  };

  if (!eventData) return null;

  const set = (updates: Partial<Event>) => setEventData(prev => prev ? { ...prev, ...updates } : null);
  const numChange = (field: keyof Event, value: string, allowDecimal = false) => {
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d+$/;
    if (value === '' || regex.test(value)) {
      set({ [field]: value === '' ? 0 : Number(value) } as any);
    }
  };

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <SidebarTitle>{eventData.id ? 'Edit Event' : 'New Event'}</SidebarTitle>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </SidebarHeader>

        <SidebarContent>
          <Section>
            <SectionTitle>Event Details</SectionTitle>
            <FormGroup><FormLabel>Event Name</FormLabel><Input value={eventData.name} onChange={e => set({ name: e.target.value })} /></FormGroup>
            <FormGroup><FormLabel>Date</FormLabel><Input type="date" value={eventData.date?.split('T')[0] || ''} onChange={e => set({ date: new Date(e.target.value).toISOString() })} /></FormGroup>
            <FormGroup><FormLabel>Location</FormLabel><Input value={eventData.location} onChange={e => set({ location: e.target.value })} /></FormGroup>
            <FormGroup>
              <FormLabel>Status</FormLabel>
              <Select value={eventData.status} onChange={e => set({ status: e.target.value as Event['status'] })}>
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </FormGroup>
          </Section>

          {eventData.id && (
            <Section>
              <SectionTitle><User size={20} style={{ display: 'inline', marginRight: 8 }} />Event Participants</SectionTitle>
              <MemberSelectBox>
                <MemberSelectHeader>
                  <Select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Select a member...</option>
                    {members.filter(m => !participants.some(p => p.memberId === m.id)).map(m => (
                      <option key={m.id} value={m.id}>{m.name} {m.handicap ? `(${m.handicap})` : ''}</option>
                    ))}
                  </Select>
                  <AddBtn onClick={handleAddMember} disabled={!selectedMember}><Plus size={16} /> Add</AddBtn>
                </MemberSelectHeader>
                {participants.map(p => {
                  const m = members.find(x => x.id === p.memberId);
                  if (!m) return null;
                  return (
                    <MemberItem key={p.id}>
                      <MemberInfo>
                        <MemberName>{m.name}</MemberName>
                        <MemberGroup>{p.memberGroup}</MemberGroup>
                        {m.handicap && <MemberGroup>H{m.handicap}</MemberGroup>}
                      </MemberInfo>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FormLabel style={{ marginBottom: 0, fontSize: 12 }}>Paid:</FormLabel>
                        <PaymentCheckbox type="checkbox" checked={p.paymentStatus === 'paid'} onChange={e => handlePaymentStatus(p.id, e.target.checked)} />
                        <RemoveBtn onClick={() => handleRemoveMember(p.id)}>×</RemoveBtn>
                      </div>
                    </MemberItem>
                  );
                })}
                {participants.length === 0 && <EmptyText>No participants. Choose members above.</EmptyText>}
              </MemberSelectBox>
              <SmallText>Total: {participants.length} | Paid: {participants.filter(p => p.paymentStatus === 'paid').length} | Unpaid: {participants.filter(p => p.paymentStatus === 'unpaid').length}</SmallText>
            </Section>
          )}

          <Section>
            <SectionTitle>{eventData.playerGroup1Name || 'Group 1'}</SectionTitle>
            <FormGroup><FormLabel>Group Name</FormLabel><Input value={eventData.playerGroup1Name || 'Members'} onChange={e => set({ playerGroup1Name: e.target.value })} /></FormGroup>
            <FormGroup><FormLabel>Player Fee</FormLabel><Input value={String(eventData.playerFee || 0)} onChange={e => numChange('playerFee', e.target.value, true)} /></FormGroup>
            <FormGroup><FormLabel>Total Players</FormLabel><Input value={String(eventData.playerCount || 0)} onChange={e => numChange('playerCount', e.target.value)} /></FormGroup>
          </Section>

          <Section>
            <SectionTitle>{eventData.playerGroup2Name || 'Group 2'}</SectionTitle>
            <FormGroup><FormLabel>Group Name</FormLabel><Input value={eventData.playerGroup2Name || 'Guests'} onChange={e => set({ playerGroup2Name: e.target.value })} /></FormGroup>
            <FormGroup><FormLabel>Player Fee</FormLabel><Input value={String(eventData.playerFee2 || 0)} onChange={e => numChange('playerFee2', e.target.value, true)} /></FormGroup>
            <FormGroup><FormLabel>Total Players</FormLabel><Input value={String(eventData.playerCount2 || 0)} onChange={e => numChange('playerCount2', e.target.value)} /></FormGroup>
          </Section>

          <Section>
            <SectionTitle>Course Fee</SectionTitle>
            <Input value={String(eventData.courseFee || 0)} onChange={e => numChange('courseFee', e.target.value, true)} />
          </Section>

          <Section>
            <SectionTitle>Cash in Bank</SectionTitle>
            <Input value={String(eventData.cashInBank || 0)} onChange={e => numChange('cashInBank', e.target.value, true)} />
          </Section>

          <Section>
            <SectionTitle>Levy</SectionTitle>
            <FormGroup><FormLabel>Levy 1 Name</FormLabel><Input value={eventData.levy1Name || 'Leicestershire'} onChange={e => set({ levy1Name: e.target.value })} /></FormGroup>
            <FormGroup><FormLabel>Levy 1 Value</FormLabel><Input value={String(eventData.levy1Value || 0)} onChange={e => numChange('levy1Value', e.target.value, true)} /></FormGroup>
            <FormGroup><FormLabel>Levy 2 Name</FormLabel><Input value={eventData.levy2Name || 'Regional'} onChange={e => set({ levy2Name: e.target.value })} /></FormGroup>
            <FormGroup><FormLabel>Levy 2 Value</FormLabel><Input value={String(eventData.levy2Value || 0)} onChange={e => numChange('levy2Value', e.target.value, true)} /></FormGroup>
          </Section>

          <Section>
            <SectionTitle>Payments</SectionTitle>
            <FormGroup><FormLabel>Bank Transfer</FormLabel><Input value={String(eventData.funds.bankTransfer || 0)} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) set({ funds: { ...eventData.funds, bankTransfer: v === '' ? 0 : Number(v) } }); }} /></FormGroup>
            <FormGroup><FormLabel>Cash</FormLabel><Input value={String(eventData.funds.cash || 0)} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) set({ funds: { ...eventData.funds, cash: v === '' ? 0 : Number(v) } }); }} /></FormGroup>
            <FormGroup><FormLabel>Card</FormLabel><Input value={String(eventData.funds.card || 0)} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) set({ funds: { ...eventData.funds, card: v === '' ? 0 : Number(v) } }); }} /></FormGroup>
          </Section>

          <Section>
            <SectionTitle>Surplus (Auto-calculated)</SectionTitle>
            <Input value={Number(eventData.surplus || 0).toFixed(2)} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            <SmallText>Total Player Income - Course Fee</SmallText>
          </Section>

          <Section>
            <SectionTitle>Notes</SectionTitle>
            <TextArea value={eventData.notes} onChange={e => set({ notes: e.target.value })} placeholder="Enter notes..." />
          </Section>

          {onDelete && eventData.id && (
            <Button variant="danger" onClick={handleDelete} style={{ marginBottom: 10 }}>
              <Trash2 size={16} /> Delete Event
            </Button>
          )}

          <SaveButton variant="primary" onClick={handleSave}>
            <Save size={16} /> {eventData.id ? 'Save Changes' : 'Create Event'}
          </SaveButton>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default EditSidebar;
