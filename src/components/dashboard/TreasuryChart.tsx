import React, { useMemo } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Event } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
`;

const Header = styled.div`margin-bottom: 20px;`;
const Title = styled.h3`font-size: 16px; font-weight: 600; color: ${p => p.theme.colors.text.primary}; margin-bottom: 4px;`;
const Desc = styled.p`font-size: 13px; color: ${p => p.theme.colors.text.secondary};`;

interface Props {
  events: Event[];
}

const TreasuryChart: React.FC<Props> = ({ events }) => {
  const { isDarkMode } = useTheme();

  const data = useMemo(() => {
    const sorted = [...events]
      .filter(e => e.status === 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = 0;
    return sorted.map(e => {
      running += e.surplus || 0;
      return {
        name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
        date: new Date(e.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        surplus: e.surplus || 0,
        cumulative: Math.round(running * 100) / 100,
      };
    });
  }, [events]);

  if (data.length < 2) return null;

  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Card>
      <Header>
        <Title>Treasury</Title>
        <Desc>Cumulative surplus across completed events</Desc>
      </Header>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={v => `£${v}`} />
          <Tooltip
            contentStyle={{
              background: isDarkMode ? '#1e293b' : '#fff',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 13,
              color: isDarkMode ? '#f8fafc' : '#0f172a',
            }}
            formatter={(value: any, name: any) => [
              `£${Number(value).toFixed(2)}`,
              name === 'cumulative' ? 'Running Total' : 'Event Surplus'
            ]}
          />
          <Line type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
          <Line type="monotone" dataKey="surplus" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TreasuryChart;
