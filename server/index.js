const express = require('express');
const cors = require('cors');
const DataStore = require('./dataStore');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function checkAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    return JSON.parse(authHeader.replace('Bearer ', ''));
  } catch { return null; }
}

function requireAuth(req, res) {
  const user = checkAuth(req);
  if (!user) { res.status(401).json({ error: 'Authentication required' }); return null; }
  return user;
}

function requireAdmin(req, res) {
  const user = checkAuth(req);
  if (!user || user.role !== 'admin') { res.status(403).json({ error: 'Admin access required' }); return null; }
  return user;
}

// Auth
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const dataStore = new DataStore();
    const user = await dataStore.authenticateUser(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, isAuthenticated: true } });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Events
app.get('/api/events', async (req, res) => {
  const user = requireAuth(req, res); if (!user) return;
  try {
    const dataStore = new DataStore();
    const events = await dataStore.getEvents();
    res.json({ success: true, events });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/events', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
  try {
    const dataStore = new DataStore();
    const event = await dataStore.createEvent(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/events', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.delete('/api/events', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

// Members
app.get('/api/members', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.post('/api/members', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.put('/api/members', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.delete('/api/members', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

// Event Participants
app.get('/api/event-participants', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.post('/api/event-participants', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.put('/api/event-participants', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.delete('/api/event-participants', async (req, res) => {
  const user = requireAdmin(req, res); if (!user) return;
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Golf Society API running on port ${PORT}`);
});
