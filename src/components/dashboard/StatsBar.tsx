import React from 'react';
import styled from 'styled-components';
import { Event } from '../../types';

const Bar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: ${p => p.theme.colors.surface};
  backdrop-filter: ${p => p.theme.blur.md};
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid ${p => p.theme.colors.border.medium};
  box-shadow: ${p => p.theme.shadows.medium};
  transition: all ${p => p.theme.animations.normal};
  animation: slideIn 0.6s ease-out;
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${p => p.theme.shadows.large};
    border-color: ${p => p.theme.colors.accent.primary};
  }
`;

const Number = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${p => p.theme.colors.text.secondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface StatsBarProps {
  events: Event[];
}

const StatsBar: React.FC<StatsBarProps> = ({ events }) => {
  const totalEvents = events.length;
  const totalRevenue = events.reduce((sum, e) => {
    return sum + (e.playerFee || 0) * (e.playerCount || 0) + (e.playerFee2 || 0) * (e.playerCount2 || 0);
  }, 0);
  const averageSurplus = totalEvents > 0
    ? events.reduce((sum, e) => sum + (e.surplus || 0), 0) / totalEvents
    : 0;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

  return (
    <Bar>
      <StatCard><Number>{totalEvents}</Number><Label>Total Events</Label></StatCard>
      <StatCard><Number>£{totalRevenue.toFixed(0)}</Number><Label>Total Revenue</Label></StatCard>
      <StatCard><Number>£{averageSurplus.toFixed(0)}</Number><Label>Avg Surplus</Label></StatCard>
      <StatCard><Number>{upcomingEvents}</Number><Label>Upcoming Events</Label></StatCard>
    </Bar>
  );
};

export default StatsBar;
