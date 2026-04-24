const express = require('express');
const cors = require('cors');
const DataStore = require('./dataStore');
const { generateToken, verifyToken, requireAdmin } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://golfsociety.uk',
  credentials: true,
}));
app.use(express.json());

// Auth — public route
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const dataStore = new DataStore();
    const user = await dataStore.authenticateUser(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All routes below require valid JWT
app.use('/api', verifyToken);

// Events — any authenticated user can read
app.get('/api/events', async (req, res) => {
  try {
    const dataStore = new DataStore();
    const events = await dataStore.getEvents();
    res.json({ success: true, events });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Events — admin only for mutations
app.post('/api/events', requireAdmin, async (req, res) => {
  try {
    const dataStore = new DataStore();
    const event = await dataStore.createEvent(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/events', requireAdmin, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    if (!id) return res.status(400).json({ error: 'Event ID is required' });

    const dataStore = new DataStore();
    const event = await dataStore.updateEvent(id, updateData);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/events', requireAdmin, async (req, res) => {
  try {
    const eventId = req.query.id;
    if (!eventId) return res.status(400).json({ error: 'Event ID is required' });

    const dataStore = new DataStore();
    const event = await dataStore.deleteEvent(eventId);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Members — admin only
app.get('/api/members', requireAdmin, async (req, res) => {
  try {
    const dataStore = new DataStore();
    const memberId = req.query.id;
    if (memberId) {
      const member = await dataStore.getMemberById(memberId);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json({ success: true, member });
    } else {
      const members = await dataStore.getMembers();
      res.json({ success: true, members });
    }
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/members', requireAdmin, async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Member name is required' });
    const dataStore = new DataStore();
    const member = await dataStore.createMember(req.body);
    res.status(201).json({ success: true, member });
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/members', requireAdmin, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    if (!id) return res.status(400).json({ error: 'Member ID is required' });
    if (!updateData.name) return res.status(400).json({ error: 'Member name is required' });

    const dataStore = new DataStore();
    const member = await dataStore.updateMember(id, updateData);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true, member });
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/members', requireAdmin, async (req, res) => {
  try {
    const deleteId = req.query.id;
    if (!deleteId) return res.status(400).json({ error: 'Member ID is required' });

    const dataStore = new DataStore();
    const member = await dataStore.deleteMember(deleteId);
    res.json({ success: true, member });
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Event Participants — admin only
app.get('/api/event-participants', requireAdmin, async (req, res) => {
  try {
    const eventId = req.query.eventId;
    if (!eventId) return res.status(400).json({ error: 'Event ID is required' });

    const dataStore = new DataStore();
    const participants = await dataStore.getEventParticipants(eventId);
    res.json({ success: true, participants });
  } catch (error) {
    console.error('Participants error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/event-participants', requireAdmin, async (req, res) => {
  try {
    const { eventId, memberId, ...participantData } = req.body;
    if (!eventId || !memberId) return res.status(400).json({ error: 'Event ID and Member ID are required' });

    const dataStore = new DataStore();
    const participant = await dataStore.addParticipantToEvent(eventId, memberId, participantData);
    res.status(201).json({ success: true, participant });
  } catch (error) {
    console.error('Participants error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/event-participants', requireAdmin, async (req, res) => {
  try {
    const { participantId, ...updateData } = req.body;
    if (!participantId) return res.status(400).json({ error: 'Participant ID is required' });

    const dataStore = new DataStore();
    const participant = await dataStore.updateParticipant(participantId, updateData);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json({ success: true, participant });
  } catch (error) {
    console.error('Participants error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/event-participants', requireAdmin, async (req, res) => {
  try {
    const { eventId, memberId } = req.query;
    if (!eventId || !memberId) return res.status(400).json({ error: 'Event ID and Member ID are required' });

    const dataStore = new DataStore();
    const participant = await dataStore.removeParticipantFromEvent(eventId, memberId);
    res.json({ success: true, participant });
  } catch (error) {
    console.error('Participants error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Scorecards
app.get('/api/scorecards', async (req, res) => {
  try {
    const eventId = req.query.eventId;
    if (!eventId) return res.status(400).json({ error: 'Event ID is required' });
    const dataStore = new DataStore();
    const scorecards = await dataStore.getScorecardsForEvent(eventId);
    res.json({ success: true, scorecards });
  } catch (error) {
    console.error('Scorecards error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/scorecards', requireAdmin, async (req, res) => {
  try {
    const { eventId, memberId } = req.body;
    if (!eventId || !memberId) return res.status(400).json({ error: 'Event ID and Member ID are required' });
    const dataStore = new DataStore();
    const scorecard = await dataStore.upsertScorecard(req.body);
    res.status(201).json({ success: true, scorecard });
  } catch (error) {
    console.error('Scorecards error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/scorecards', requireAdmin, async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Scorecard ID is required' });
    const dataStore = new DataStore();
    await dataStore.deleteScorecard(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Scorecards error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const season = req.query.season || new Date().getFullYear();
    const dataStore = new DataStore();
    const entries = await dataStore.getLeaderboard(Number(season));
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Weather proxy (Open-Meteo, free, no key)
const weatherCache = new Map();
app.get('/api/weather', async (req, res) => {
  try {
    const location = req.query.location;
    if (!location) return res.status(400).json({ error: 'Location is required' });

    const cacheKey = location.toLowerCase().trim();
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return res.json({ success: true, weather: cached.data });
    }

    // Geocode location name to lat/lon
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { latitude, longitude, name: resolvedName } = geoData.results[0];

    // Get weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon&forecast_days=5`
    );
    const weatherData = await weatherRes.json();

    const result = {
      location: resolvedName,
      current: weatherData.current ? {
        temperature: weatherData.current.temperature_2m,
        weatherCode: weatherData.current.weather_code,
        windSpeed: weatherData.current.wind_speed_10m,
      } : null,
      daily: (weatherData.daily?.time || []).map((date, i) => ({
        date,
        weatherCode: weatherData.daily.weather_code[i],
        tempMax: weatherData.daily.temperature_2m_max[i],
        tempMin: weatherData.daily.temperature_2m_min[i],
        rainChance: weatherData.daily.precipitation_probability_max[i],
      })),
    };

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json({ success: true, weather: result });
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Golf Society API running on port ${PORT}`);
});
