import React from 'react';
import styled from 'styled-components';
import { Event, EventParticipant } from '../../types';
import { formatDateBritish } from '../../utils/dateUtils';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import ParticipantsSection from './ParticipantsSection';
import ScorecardEntry from './ScorecardEntry';
import WeatherWidget from './WeatherWidget';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 16px; }
`;

const EventInfo = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const Row = styled.div`display: flex; justify-content: space-between; align-items: center; font-size: 14px;`;
const Label = styled.span`color: ${p => p.theme.colors.text.secondary}; font-weight: 500;`;
const Value = styled.span`color: ${p => p.theme.colors.text.primary}; font-weight: 600;`;

const FundsList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const FundItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 8px 0;
  border-bottom: 1px solid ${p => p.theme.colors.border.light};
  &:last-child { border-bottom: none; font-weight: 600; padding-top: 12px; border-top: 1px solid ${p => p.theme.colors.border.medium}; }
`;
const FundLabel = styled.span`color: ${p => p.theme.colors.text.secondary}; font-size: 14px;`;
const FundAmount = styled.span`color: ${p => p.theme.colors.text.primary}; font-weight: 600; font-size: 14px;`;

const StatValue = styled.div`font-size: 36px; font-weight: 800; color: ${p => p.theme.colors.text.primary}; margin-bottom: 8px;`;
const StatLabel = styled.div`font-size: 14px; color: ${p => p.theme.colors.text.secondary}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;`;

const SurplusCard = styled(Card)`background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;`;
const SurplusHeader = styled(CardHeader)`border-bottom: 1px solid rgba(255,255,255,0.2);`;
const SurplusTitle = styled(CardTitle)`color: white;`;
const SurplusValue = styled(StatValue)`color: white;`;

const NotesCard = styled(Card)`grid-column: 1 / -1;`;
const NotesText = styled.div`color: ${p => p.theme.colors.text.secondary}; font-size: 14px; line-height: 1.6; white-space: pre-wrap;`;

const TotalRow = styled(Row)`
  border-top: 1px solid ${p => p.theme.colors.border.medium};
  padding-top: 12px; margin-top: 8px; font-weight: 600;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${p =>
    p.status === 'completed' ? '#dcfce7' :
    p.status === 'in-progress' ? '#dbeafe' : '#fef3c7'};
  color: ${p =>
    p.status === 'completed' ? '#15803d' :
    p.status === 'in-progress' ? '#1e40af' : '#d97706'};
  border: 1px solid ${p =>
    p.status === 'completed' ? '#bbf7d0' :
    p.status === 'in-progress' ? '#bfdbfe' : '#fed7aa'};
`;

const StatusDot = styled.div<{ status: string }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${p =>
    p.status === 'completed' ? '#15803d' :
    p.status === 'in-progress' ? '#1e40af' : '#d97706'};
`;

interface Props {
  event: Event;
  participants: EventParticipant[];
  isAdmin?: boolean;
}

const EventDetail: React.FC<Props> = ({ event, participants, isAdmin = false }) => {
  const totalFunds = (event.funds?.bankTransfer || 0) + (event.funds?.cash || 0) + (event.funds?.card || 0);
  const income1 = (event.playerFee || 0) * (event.playerCount || 0);
  const income2 = (event.playerFee2 || 0) * (event.playerCount2 || 0);
  const surplus = income1 + income2 - (event.courseFee || 0);

  return (
    <Grid>
      <Card>
        <CardHeader><CardTitle>Current Event</CardTitle></CardHeader>
        <CardContent>
          <EventInfo>
            <Row><Label>Event:</Label><Value>{event.name}</Value></Row>
            <Row><Label>Location:</Label><Value>{event.location || 'TBD'}</Value></Row>
            <Row><Label>Status:</Label><StatusBadge status={event.status}><StatusDot status={event.status} />{event.status === 'in-progress' ? 'In Progress' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}</StatusBadge></Row>
            <Row><Label>Total Players:</Label><Value>{(event.playerCount || 0) + (event.playerCount2 || 0)}</Value></Row>
            <Row><Label>Date:</Label><Value>{formatDateBritish(event.date)}</Value></Row>
          </EventInfo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{event.playerGroup1Name || 'Group 1'} Information</CardTitle></CardHeader>
        <CardContent>
          <EventInfo>
            <Row><Label>Player Fee:</Label><Value>£{(event.playerFee || 0).toFixed(2)}</Value></Row>
            <Row><Label>Total Players:</Label><Value>{event.playerCount || 0}</Value></Row>
            <TotalRow><Label>Group Income:</Label><Value style={{ fontSize: '18px', color: '#059669' }}>£{income1.toFixed(2)}</Value></TotalRow>
          </EventInfo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{event.playerGroup2Name || 'Group 2'} Information</CardTitle></CardHeader>
        <CardContent>
          <EventInfo>
            <Row><Label>Player Fee:</Label><Value>£{(event.playerFee2 || 0).toFixed(2)}</Value></Row>
            <Row><Label>Total Players:</Label><Value>{event.playerCount2 || 0}</Value></Row>
            <TotalRow><Label>Group Income:</Label><Value style={{ fontSize: '18px', color: '#059669' }}>£{income2.toFixed(2)}</Value></TotalRow>
          </EventInfo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent>
          <FundsList>
            <FundItem><FundLabel>Bank Transfer</FundLabel><FundAmount>£{(event.funds?.bankTransfer || 0).toFixed(2)}</FundAmount></FundItem>
            <FundItem><FundLabel>Cash</FundLabel><FundAmount>£{(event.funds?.cash || 0).toFixed(2)}</FundAmount></FundItem>
            <FundItem><FundLabel>Card</FundLabel><FundAmount>£{(event.funds?.card || 0).toFixed(2)}</FundAmount></FundItem>
            <FundItem><FundLabel>Total</FundLabel><FundAmount>£{totalFunds.toFixed(2)}</FundAmount></FundItem>
          </FundsList>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cash in Bank</CardTitle></CardHeader>
        <CardContent>
          <StatValue>£{(event.cashInBank || 0).toFixed(2)}</StatValue>
          <StatLabel>as per {formatDateBritish(event.date)}</StatLabel>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Levy</CardTitle></CardHeader>
        <CardContent>
          <FundsList>
            <FundItem><FundLabel>{event.levy1Name || 'Leicestershire'}</FundLabel><FundAmount>£{(event.levy1Value || 0).toFixed(2)}</FundAmount></FundItem>
            <FundItem><FundLabel>{event.levy2Name || 'Regional'}</FundLabel><FundAmount>£{(event.levy2Value || 0).toFixed(2)}</FundAmount></FundItem>
            <FundItem><FundLabel>Total Levy</FundLabel><FundAmount>£{((event.levy1Value || 0) + (event.levy2Value || 0)).toFixed(2)}</FundAmount></FundItem>
          </FundsList>
        </CardContent>
      </Card>

      <SurplusCard>
        <SurplusHeader><SurplusTitle>Surplus Funds on the day</SurplusTitle></SurplusHeader>
        <CardContent>
          <SurplusValue>£{surplus.toFixed(2)}</SurplusValue>
          <StatLabel style={{ color: 'rgba(255,255,255,0.8)' }}>Total Player Income - Course Fee</StatLabel>
        </CardContent>
      </SurplusCard>

      {event.location && (event.status === 'upcoming' || event.status === 'in-progress') && (
        <Card style={{ gridColumn: '1 / -1' }}>
          <CardContent>
            <WeatherWidget location={event.location} />
          </CardContent>
        </Card>
      )}

      {event.notes && (
        <NotesCard>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><NotesText>{event.notes}</NotesText></CardContent>
        </NotesCard>
      )}

      <ScorecardEntry eventId={event.id} isAdmin={isAdmin} />

      <ParticipantsSection participants={participants} />
    </Grid>
  );
};

export default EventDetail;
