import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, Users, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event, User } from '../types';
import { apiService } from '../services/api';
import CountdownCard from './dashboard/CountdownCard';
import StatsBar from './dashboard/StatsBar';
import TreasuryChart from './dashboard/TreasuryChart';

const Title = styled.h1`color: ${p => p.theme.colors.text.primary}; font-size: 24px; font-weight: 600; margin-bottom: 8px;`;
const Subtitle = styled.p`color: ${p => p.theme.colors.text.secondary}; font-size: 14px; margin-bottom: 32px;`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 32px;
`;

const LinkCard = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.shadows.medium};
    border-color: ${p => p.theme.colors.accent.primary};
  }
  &::before { display: none; }
`;

const LinkIcon = styled.div<{ color: string }>`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${p => p.color};
  display: flex; align-items: center; justify-content: center;
  color: white;
`;

const LinkText = styled.div`flex: 1;`;
const LinkTitle = styled.div`font-size: 14px; font-weight: 600; color: ${p => p.theme.colors.text.primary};`;
const LinkDesc = styled.div`font-size: 12px; color: ${p => p.theme.colors.text.secondary}; margin-top: 2px;`;

interface Props {
  user: User;
}

const DashboardHome: React.FC<Props> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.getEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nextEvent = events
    .filter(e => e.status === 'upcoming' || e.status === 'in-progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <>
      <Title>Welcome back, {user.username}</Title>
      <Subtitle>Here's what's happening in your golf society</Subtitle>

      <CountdownCard event={nextEvent} loading={loading} />

      {!loading && events.length > 0 && (
        <>
          <StatsBar events={events} />
          <TreasuryChart events={events} />
        </>
      )}

      <QuickLinks>
        <LinkCard onClick={() => navigate('/events')}>
          <LinkIcon color="#6366f1"><Calendar size={20} /></LinkIcon>
          <LinkText>
            <LinkTitle>Events</LinkTitle>
            <LinkDesc>Manage events & finances</LinkDesc>
          </LinkText>
          <ArrowRight size={16} color="#94a3b8" />
        </LinkCard>
        {user.role === 'admin' && (
          <LinkCard onClick={() => navigate('/members')}>
            <LinkIcon color="#10b981"><Users size={20} /></LinkIcon>
            <LinkText>
              <LinkTitle>Members</LinkTitle>
              <LinkDesc>View & manage members</LinkDesc>
            </LinkText>
            <ArrowRight size={16} color="#94a3b8" />
          </LinkCard>
        )}
        <LinkCard onClick={() => navigate('/leaderboard')}>
          <LinkIcon color="#f59e0b"><Trophy size={20} /></LinkIcon>
          <LinkText>
            <LinkTitle>Leaderboard</LinkTitle>
            <LinkDesc>Season standings</LinkDesc>
          </LinkText>
          <ArrowRight size={16} color="#94a3b8" />
        </LinkCard>
      </QuickLinks>
    </>
  );
};

export default DashboardHome;
