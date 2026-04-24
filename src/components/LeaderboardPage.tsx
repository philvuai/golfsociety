import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, Award, Star } from 'lucide-react';
import { apiService } from '../services/api';
import { LeaderboardEntry } from '../types';

const Title = styled.h1`color: ${p => p.theme.colors.text.primary}; font-size: 24px; font-weight: 600; margin-bottom: 8px;`;
const Subtitle = styled.p`color: ${p => p.theme.colors.text.secondary}; font-size: 14px; margin-bottom: 24px;`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SeasonSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 8px;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.text.primary};
  font-size: 14px;
`;

const Table = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 80px 80px 80px 60px 60px;
  padding: 12px 16px;
  background: ${p => p.theme.colors.surfaceElevated};
  border-bottom: 1px solid ${p => p.theme.colors.border.medium};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${p => p.theme.colors.text.secondary};
  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 60px 60px;
    & > *:nth-child(5), & > *:nth-child(6), & > *:nth-child(7) { display: none; }
  }
`;

const TableRow = styled.div<{ rank: number }>`
  display: grid;
  grid-template-columns: 50px 1fr 80px 80px 80px 60px 60px;
  padding: 14px 16px;
  align-items: center;
  border-bottom: 1px solid ${p => p.theme.colors.border.light};
  background: ${p => p.rank <= 3 ? (p.rank === 1 ? 'rgba(251,191,36,0.08)' : p.rank === 2 ? 'rgba(148,163,184,0.08)' : 'rgba(180,83,9,0.08)') : 'transparent'};
  &:last-child { border-bottom: none; }
  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 60px 60px;
    & > *:nth-child(5), & > *:nth-child(6), & > *:nth-child(7) { display: none; }
  }
`;

const RankCell = styled.div<{ rank: number }>`
  font-weight: 700;
  font-size: 16px;
  color: ${p => p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#94a3b8' : p.rank === 3 ? '#b45309' : p.theme.colors.text.secondary};
`;

const NameCell = styled.div`font-weight: 600; color: ${p => p.theme.colors.text.primary}; font-size: 14px;`;
const Cell = styled.div`font-size: 14px; color: ${p => p.theme.colors.text.primary}; text-align: center;`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: ${p => p.theme.colors.text.secondary};
  svg { margin-bottom: 16px; opacity: 0.4; }
  h3 { font-size: 18px; margin-bottom: 8px; color: ${p => p.theme.colors.text.primary}; }
  p { font-size: 14px; }
`;

const LeaderboardPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState(currentYear);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService.getLeaderboard(season)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [season]);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <>
      <Title>Leaderboard</Title>
      <Subtitle>Season standings and competition results</Subtitle>

      <Controls>
        <SeasonSelect value={season} onChange={e => setSeason(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y} Season</option>)}
        </SeasonSelect>
      </Controls>

      {loading ? (
        <EmptyState><p>Loading...</p></EmptyState>
      ) : entries.length === 0 ? (
        <EmptyState>
          <Trophy size={48} />
          <h3>No scores yet</h3>
          <p>Scorecards will appear here once they've been entered for events in this season.</p>
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <div>#</div>
            <div>Player</div>
            <div style={{ textAlign: 'center' }}>Played</div>
            <div style={{ textAlign: 'center' }}>Points</div>
            <div style={{ textAlign: 'center' }}>Avg Score</div>
            <div style={{ textAlign: 'center' }}>NTP</div>
            <div style={{ textAlign: 'center' }}>LD</div>
          </TableHeader>
          {entries.map((entry, i) => (
            <TableRow key={entry.memberId} rank={i + 1}>
              <RankCell rank={i + 1}>
                {i === 0 ? <Trophy size={18} /> : i === 1 ? <Award size={18} /> : i === 2 ? <Star size={18} /> : i + 1}
              </RankCell>
              <NameCell>{entry.memberName}</NameCell>
              <Cell>{entry.eventsPlayed}</Cell>
              <Cell>{entry.totalPoints}</Cell>
              <Cell>{entry.avgScore?.toFixed(1) || '-'}</Cell>
              <Cell>{entry.ntpCount}</Cell>
              <Cell>{entry.ldCount}</Cell>
            </TableRow>
          ))}
        </Table>
      )}
    </>
  );
};

export default LeaderboardPage;
