const fs = require('fs').promises;
const path = require('path');

// In production, this would typically use a proper database
// For now, we'll use Netlify's persistent storage capabilities
const DATA_FILE = '/tmp/golf-society-data.json';

// Default data structure
const DEFAULT_DATA = {
  events: [
    {
      id: '1',
      name: 'Monthly Tournament',
      date: new Date().toISOString(),
      location: 'Hillside Golf Club',
      status: 'in-progress',
      players: ['1', '2', '3'],
      playerCount: 3,
      playerFee: 50.00,
      courseFee: 45.00,
      cashInBank: 1500.00,
      funds: { bankTransfer: 1000, cash: 500, card: 250 },
      surplus: 200,
      notes: 'Tournament registration is now open. Please confirm your attendance by Friday.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    }
  ],
  users: [
    {
      id: '1',
      username: 'admin',
      passwordHash: 'golfsociety2024', // In production, this would be properly hashed
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'viewer',
      passwordHash: 'viewonly2024', // In production, this would be properly hashed
      role: 'viewer',
      createdAt: new Date().toISOString()
    }
  ],
  lastUpdated: new Date().toISOString()
};

class DataStore {
  async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch (error) {
      // File doesn't exist, create it with default data
      await this.saveData(DEFAULT_DATA);
    }
  }

  async loadData() {
    await this.ensureDataFile();
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading data:', error);
      return DEFAULT_DATA;
    }
  }

  async saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async getEvents() {
    const data = await this.loadData();
    return data.events.filter(event => !event.deletedAt);
  }

  async getEventById(id) {
    const data = await this.loadData();
    return data.events.find(event => event.id === id && !event.deletedAt);
  }

  async createEvent(eventData) {
    const data = await this.loadData();
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    };
    data.events.push(newEvent);
    await this.saveData(data);
    return newEvent;
  }

  async updateEvent(id, updates) {
    const data = await this.loadData();
    const eventIndex = data.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    data.events[eventIndex] = {
      ...data.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveData(data);
    return data.events[eventIndex];
  }

  async deleteEvent(id) {
    const data = await this.loadData();
    const eventIndex = data.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    data.events[eventIndex].deletedAt = new Date().toISOString();
    data.events[eventIndex].updatedAt = new Date().toISOString();
    
    await this.saveData(data);
    return data.events[eventIndex];
  }

  async authenticateUser(username, password) {
    const data = await this.loadData();
    const user = data.users.find(u => u.username === username && u.passwordHash === password);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        isAuthenticated: true
      };
    }
    return null;
  }
}

module.exports = DataStore;
