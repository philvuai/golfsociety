import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Event } from '../../types';
import { formatDateBritish } from '../../utils/dateUtils';

const Card = styled.div`
  background: ${p => p.theme.colors.gradient.secondary};
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    top: -50%; right: -20%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const EventName = styled.h2`font-size: 22px; font-weight: 700; margin-bottom: 8px;`;

const Meta = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
`;

const CountdownGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const TimeBlock = styled.div`
  text-align: center;
  min-width: 70px;
`;

const TimeValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
`;

const TimeLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
`;

const EmptyCard = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: ${p => p.theme.colors.text.secondary};
  h3 { color: ${p => p.theme.colors.text.primary}; margin-bottom: 8px; }
`;

interface Props {
  event?: Event;
  loading: boolean;
}

function getTimeRemaining(targetDate: string) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    passed: false,
  };
}

const CountdownCard: React.FC<Props> = ({ event, loading }) => {
  const [time, setTime] = useState(() => event ? getTimeRemaining(event.date) : null);

  useEffect(() => {
    if (!event) return;
    setTime(getTimeRemaining(event.date));
    const interval = setInterval(() => setTime(getTimeRemaining(event.date)), 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return <EmptyCard><p>Loading...</p></EmptyCard>;
  }

  if (!event) {
    return (
      <EmptyCard>
        <Calendar size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <h3>No upcoming events</h3>
        <p>Create a new event to see the countdown here.</p>
      </EmptyCard>
    );
  }

  return (
    <Card>
      <EventName>{event.name}</EventName>
      <Meta>
        {event.location && (
          <MetaItem><MapPin size={16} /> {event.location}</MetaItem>
        )}
        <MetaItem><Calendar size={16} /> {formatDateBritish(event.date)}</MetaItem>
      </Meta>
      {time && !time.passed ? (
        <CountdownGrid>
          <TimeBlock><TimeValue>{time.days}</TimeValue><TimeLabel>Days</TimeLabel></TimeBlock>
          <TimeBlock><TimeValue>{time.hours}</TimeValue><TimeLabel>Hours</TimeLabel></TimeBlock>
          <TimeBlock><TimeValue>{time.minutes}</TimeValue><TimeLabel>Minutes</TimeLabel></TimeBlock>
          <TimeBlock><TimeValue>{time.seconds}</TimeValue><TimeLabel>Seconds</TimeLabel></TimeBlock>
        </CountdownGrid>
      ) : (
        <MetaItem><Clock size={16} /> Event is underway or has passed</MetaItem>
      )}
    </Card>
  );
};

export default CountdownCard;
