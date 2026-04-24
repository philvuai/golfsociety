import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, Award, Target } from 'lucide-react';
import { Scorecard, Member } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

const FullWidthCard = styled(Card)`grid-column: 1 / -1;`;

const AddRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${p => p.theme.colors.text.secondary};
`;

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 6px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  font-size: 13px;
  min-width: 150px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 6px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  font-size: 13px;
  width: 70px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${p => p.theme.colors.text.secondary};
  cursor: pointer;
  padding: 8px 0;
  input { cursor: pointer; }
`;

const Btn = styled.button<{ variant?: string }>`
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  background: ${p => p.variant === 'danger' ? p.theme.colors.status.error : p.theme.colors.accent.primary};
  color: white;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &::before { display: none; }
`;

const Table = styled.div`
  border: 1px solid ${p => p.theme.colors.border.light};
  border-radius: 8px;
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 70px 70px 60px 50px 50px 40px;
  padding: 10px 12px;
  background: ${p => p.theme.colors.surfaceElevated};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${p => p.theme.colors.text.secondary};
  @media (max-width: 768px) {
    grid-template-columns: 30px 1fr 60px 60px 40px;
    & > *:nth-child(5), & > *:nth-child(6), & > *:nth-child(7) { display: none; }
  }
`;

const TRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 70px 70px 60px 50px 50px 40px;
  padding: 10px 12px;
  align-items: center;
  border-top: 1px solid ${p => p.theme.colors.border.light};
  font-size: 13px;
  color: ${p => p.theme.colors.text.primary};
  @media (max-width: 768px) {
    grid-template-columns: 30px 1fr 60px 60px 40px;
    & > *:nth-child(5), & > *:nth-child(6), & > *:nth-child(7) { display: none; }
  }
`;

const IconCell = styled.div`
  color: ${p => p.theme.colors.text.tertiary};
  display: flex; gap: 2px;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.colors.text.tertiary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  &:hover { color: ${p => p.theme.colors.status.error}; background: ${p => p.theme.colors.status.error}20; }
  &::before { display: none; }
`;

interface Props {
  eventId: string;
  isAdmin: boolean;
}

const ScorecardEntry: React.FC<Props> = ({ eventId, isAdmin }) => {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Add form state
  const [selectedMember, setSelectedMember] = useState('');
  const [score, setScore] = useState('');
  const [points, setPoints] = useState('');
  const [ntp, setNtp] = useState(false);
  const [ld, setLd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiService.getScorecards(eventId),
      isAdmin ? apiService.getMembers() : Promise.resolve([]),
    ]).then(([sc, mem]) => {
      setScorecards(sc);
      setMembers(mem);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [eventId, isAdmin]);

  const handleAdd = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      const sc = await apiService.upsertScorecard({
        eventId,
        memberId: selectedMember,
        score: score ? Number(score) : undefined,
        stablefordPoints: points ? Number(points) : undefined,
        nearestPin: ntp,
        longestDrive: ld,
      });
      setScorecards(prev => {
        const filtered = prev.filter(s => s.memberId !== sc.memberId);
        return [...filtered, sc].sort((a, b) => (a.position || 999) - (b.position || 999));
      });
      setSelectedMember('');
      setScore('');
      setPoints('');
      setNtp(false);
      setLd(false);
      showToast('Scorecard saved', 'success');
    } catch {
      showToast('Failed to save scorecard', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteScorecard(id);
      setScorecards(prev => prev.filter(s => s.id !== id));
      showToast('Scorecard removed', 'success');
    } catch {
      showToast('Failed to delete scorecard', 'error');
    }
  };

  if (loading) return null;

  const existingMemberIds = new Set(scorecards.map(s => s.memberId));
  const availableMembers = members.filter(m => !existingMemberIds.has(m.id));

  return (
    <FullWidthCard>
      <CardHeader><CardTitle>Scorecards ({scorecards.length})</CardTitle></CardHeader>
      <CardContent>
        {isAdmin && availableMembers.length > 0 && (
          <AddRow>
            <Field>
              <FieldLabel>Member</FieldLabel>
              <Select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                <option value="">Select...</option>
                {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Score</FieldLabel>
              <Input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="72" />
            </Field>
            <Field>
              <FieldLabel>Points</FieldLabel>
              <Input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="36" />
            </Field>
            <Checkbox><input type="checkbox" checked={ntp} onChange={e => setNtp(e.target.checked)} /> NTP</Checkbox>
            <Checkbox><input type="checkbox" checked={ld} onChange={e => setLd(e.target.checked)} /> LD</Checkbox>
            <Btn onClick={handleAdd} disabled={!selectedMember || saving}>
              <Plus size={14} /> Add
            </Btn>
          </AddRow>
        )}

        {scorecards.length > 0 && (
          <Table>
            <THead>
              <div>#</div>
              <div>Player</div>
              <div style={{ textAlign: 'center' }}>Score</div>
              <div style={{ textAlign: 'center' }}>Points</div>
              <div style={{ textAlign: 'center' }}>HCP</div>
              <div style={{ textAlign: 'center' }}>NTP</div>
              <div style={{ textAlign: 'center' }}>LD</div>
              <div></div>
            </THead>
            {scorecards.map((sc, i) => (
              <TRow key={sc.id}>
                <div style={{ fontWeight: 600, color: i < 3 ? '#fbbf24' : undefined }}>{i + 1}</div>
                <div style={{ fontWeight: 500 }}>{sc.member?.name || 'Unknown'}</div>
                <div style={{ textAlign: 'center' }}>{sc.score ?? '-'}</div>
                <div style={{ textAlign: 'center', fontWeight: 600 }}>{sc.stablefordPoints ?? '-'}</div>
                <div style={{ textAlign: 'center' }}>{sc.handicapAtTime ?? sc.member?.handicap ?? '-'}</div>
                <IconCell style={{ justifyContent: 'center' }}>{sc.nearestPin && <Target size={14} color="#10b981" />}</IconCell>
                <IconCell style={{ justifyContent: 'center' }}>{sc.longestDrive && <Award size={14} color="#f59e0b" />}</IconCell>
                <div>
                  {isAdmin && (
                    <DeleteBtn onClick={() => handleDelete(sc.id)} title="Remove">
                      <Trash2 size={14} />
                    </DeleteBtn>
                  )}
                </div>
              </TRow>
            ))}
          </Table>
        )}

        {scorecards.length === 0 && !isAdmin && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '14px' }}>
            No scorecards recorded for this event yet.
          </div>
        )}
      </CardContent>
    </FullWidthCard>
  );
};

export default ScorecardEntry;
