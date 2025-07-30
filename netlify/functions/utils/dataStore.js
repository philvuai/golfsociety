// Using Netlify Blob storage for persistent data
// This provides permanent, persistent storage that survives function cold starts
const { getStore } = require('@netlify/blobs');

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

// Blob storage configuration
const BLOB_STORE_NAME = 'golf-society-data';
const DATA_BLOB_KEY = 'application-data';

class DataStore {
  constructor() {
    this.store = getStore(BLOB_STORE_NAME);
  }

  async loadData() {
    try {
      const storedData = await this.store.get(DATA_BLOB_KEY, { type: 'json' });
      if (storedData) {
        return storedData;
      }
      // If no data exists, initialize with default data
      await this.saveData(DEFAULT_DATA);
      return DEFAULT_DATA;
    } catch (error) {
      console.error('Error loading data from blob storage:', error);
      // Fallback to default data if blob read fails
      return DEFAULT_DATA;
    }
  }

  async saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      await this.store.set(DATA_BLOB_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data to blob storage:', error);
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
