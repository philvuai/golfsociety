import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from 'lucide-react';
import { apiService } from '../../services/api';

const Container = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border.medium};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const Header = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.theme.colors.text.secondary};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Current = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Temp = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${p => p.theme.colors.text.primary};
`;

const Conditions = styled.div`
  font-size: 13px;
  color: ${p => p.theme.colors.text.secondary};
`;

const Forecast = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const DayCard = styled.div`
  flex: 1;
  min-width: 60px;
  text-align: center;
  padding: 8px 4px;
  border-radius: 8px;
  background: ${p => p.theme.colors.surfaceElevated};
  font-size: 12px;
  color: ${p => p.theme.colors.text.secondary};
`;

const DayTemp = styled.div`
  font-weight: 600;
  color: ${p => p.theme.colors.text.primary};
  margin: 4px 0;
`;

const DayLabel = styled.div`font-size: 11px;`;

const RainChance = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  color: #3b82f6;
  margin-top: 2px;
`;

function getWeatherIcon(code: number, size = 20) {
  if (code <= 1) return <Sun size={size} color="#fbbf24" />;
  if (code <= 3) return <Cloud size={size} color="#94a3b8" />;
  if (code <= 48) return <Cloud size={size} color="#64748b" />;
  if (code <= 67) return <CloudRain size={size} color="#3b82f6" />;
  if (code <= 77) return <CloudSnow size={size} color="#93c5fd" />;
  if (code <= 82) return <CloudRain size={size} color="#2563eb" />;
  if (code <= 86) return <CloudSnow size={size} color="#60a5fa" />;
  return <CloudLightning size={size} color="#f59e0b" />;
}

function getWeatherDesc(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

interface Props {
  location: string;
}

const WeatherWidget: React.FC<Props> = ({ location }) => {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) return;
    apiService.getWeather(location)
      .then(setWeather)
      .catch(() => setError(true));
  }, [location]);

  if (error || !weather) return null;

  return (
    <Container>
      <Header>Weather — {weather.location}</Header>
      {weather.current && (
        <Current>
          {getWeatherIcon(weather.current.weatherCode, 32)}
          <div>
            <Temp>{Math.round(weather.current.temperature)}°C</Temp>
            <Conditions>
              {getWeatherDesc(weather.current.weatherCode)}
              <span style={{ marginLeft: 8 }}>
                <Wind size={12} style={{ verticalAlign: 'middle' }} /> {Math.round(weather.current.windSpeed)} km/h
              </span>
            </Conditions>
          </div>
        </Current>
      )}
      <Forecast>
        {weather.daily?.slice(0, 5).map((day: any) => {
          const d = new Date(day.date);
          const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
          return (
            <DayCard key={day.date}>
              <DayLabel>{label}</DayLabel>
              {getWeatherIcon(day.weatherCode, 18)}
              <DayTemp>{Math.round(day.tempMax)}°</DayTemp>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{Math.round(day.tempMin)}°</div>
              {day.rainChance > 0 && (
                <RainChance><Droplets size={10} />{day.rainChance}%</RainChance>
              )}
            </DayCard>
          );
        })}
      </Forecast>
    </Container>
  );
};

export default WeatherWidget;
