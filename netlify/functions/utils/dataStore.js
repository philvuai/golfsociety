// For Netlify Functions, we'll use a simple in-memory store
// In a production environment, you'd use a proper database like FaunaDB, Supabase, or Airtable
// This approach stores data in memory and resets on function cold starts
// which is fine for demonstration but should be upgraded for production use

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

// In-memory data store (resets on cold starts)
// In production, replace this with a proper database
let dataCache = null;

class DataStore {
  async loadData() {
    if (!dataCache) {
      dataCache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return dataCache;
  }

  async saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      dataCache = data;
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
