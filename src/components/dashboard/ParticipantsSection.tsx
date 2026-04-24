import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { EventParticipant } from '../../types';

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.light};
  border-radius: 12px;
  margin-bottom: 16px;
`;

const SummaryItem = styled.div`text-align: center;`;
const SummaryNumber = styled.div`
  font-size: 24px; font-weight: 700; color: ${p => p.theme.colors.text.primary}; margin-bottom: 4px;
`;
const SummaryLabel = styled.div`
  font-size: 11px; color: ${p => p.theme.colors.text.secondary}; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 12px; }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.light};
  border-radius: 12px;
  transition: all 0.2s ease;
  &:hover {
    border-color: ${p => p.theme.colors.accent.primary};
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.shadows.small};
  }
`;

const Info = styled.div`display: flex; flex-direction: column; gap: 4px; flex: 1;`;
const Name = styled.div`font-weight: 600; color: ${p => p.theme.colors.text.primary}; font-size: 14px;`;
const Details = styled.div`display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${p => p.theme.colors.text.secondary};`;

const Badge = styled.span<{ variant: 'group' | 'handicap' }>`
  background: ${p => p.variant === 'group' ? p.theme.colors.accent.primary : p.theme.colors.surface};
  color: ${p => p.variant === 'group' ? 'white' : p.theme.colors.text.secondary};
  padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: capitalize;
`;

const PaymentStatus = styled.div<{ isPaid: boolean }>`
  display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
  background: ${p => p.isPaid ? '#dcfce7' : '#fef3c7'};
  color: ${p => p.isPaid ? '#15803d' : '#d97706'};
  border: 1px solid ${p => p.isPaid ? '#bbf7d0' : '#fed7aa'};
`;

const Dot = styled.div<{ isPaid: boolean }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${p => p.isPaid ? '#15803d' : '#d97706'};
`;

interface Props {
  participants: EventParticipant[];
}

const ParticipantsSection: React.FC<Props> = ({ participants }) => {
  if (participants.length === 0) return null;

  const paid = participants.filter(p => p.paymentStatus === 'paid').length;
  const unpaid = participants.filter(p => p.paymentStatus === 'unpaid').length;

  return (
    <FullWidthCard>
      <CardHeader><CardTitle>Event Participants ({participants.length})</CardTitle></CardHeader>
      <CardContent>
        <Summary>
          <SummaryItem><SummaryNumber>{participants.length}</SummaryNumber><SummaryLabel>Total</SummaryLabel></SummaryItem>
          <SummaryItem><SummaryNumber>{paid}</SummaryNumber><SummaryLabel>Paid</SummaryLabel></SummaryItem>
          <SummaryItem><SummaryNumber>{unpaid}</SummaryNumber><SummaryLabel>Unpaid</SummaryLabel></SummaryItem>
        </Summary>
        <List>
          {participants.map(p => (
            <Item key={p.id}>
              <Info>
                <Name>{p.member?.name || 'Unknown'}</Name>
                <Details>
                  {p.memberGroup && <Badge variant="group">{p.memberGroup}</Badge>}
                  {p.member?.handicap && <Badge variant="handicap">HCP: {p.member.handicap}</Badge>}
                </Details>
              </Info>
              <PaymentStatus isPaid={p.paymentStatus === 'paid'}>
                <Dot isPaid={p.paymentStatus === 'paid'} />
                {p.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </PaymentStatus>
            </Item>
          ))}
        </List>
      </CardContent>
    </FullWidthCard>
  );
};

export default ParticipantsSection;
