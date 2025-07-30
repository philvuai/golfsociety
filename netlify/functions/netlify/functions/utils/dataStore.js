import { neon } from '@netlify/neon';

const sql = neon();

class DataStore {
  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Create users table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL
        );
      `;

      // Create events table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          date DATE NOT NULL,
          course TEXT NOT NULL,
          status TEXT NOT NULL,
          playerCount INTEGER NOT NULL,
          playerFee NUMERIC NOT NULL,
          courseFee NUMERIC NOT NULL,
          payments JSONB NOT NULL,
          surplus NUMERIC NOT NULL,
          notes TEXT,
          cashInBank NUMERIC
        );
      `;

      // Check if we need to seed default users
      const users = await sql`SELECT COUNT(*) as count FROM users`;
      if (users[0].count === '0') {
        await this.seedDefaultUsers();
      }

      // Check if we need to seed default events
      const events = await sql`SELECT COUNT(*) as count FROM events`;
      if (events[0].count === '0') {
        await this.seedDefaultEvents();
      }

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async seedDefaultUsers() {
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'viewer', password: 'viewer123', role: 'viewer' }
    ];

    for (const user of defaultUsers) {
      await sql`
        INSERT INTO users (username, password, role)
        VALUES (${user.username}, ${user.password}, ${user.role})
      `;
    }
    console.log('Default users seeded');
  }

  async seedDefaultEvents() {
    const defaultEvents = [
      {
        name: 'Spring Championship',
        date: '2024-04-15',
        course: 'Royal Oak Golf Club',
        status: 'completed',
        playerCount: 16,
        playerFee: 25.00,
        courseFee: 18.50,
        payments: JSON.stringify({ bankTransfer: 200.00, cash: 150.00, card: 50.00 }),
        surplus: 296.00,
        notes: 'Great weather, excellent turnout',
        cashInBank: 200.00
      },
      {
        name: 'Summer Open',
        date: '2024-07-20',
        course: 'Meadow View Golf Course',
        status: 'upcoming',
        playerCount: 12,
        playerFee: 30.00,
        courseFee: 22.00,
        payments: JSON.stringify({ bankTransfer: 0.00, cash: 0.00, card: 0.00 }),
        surplus: 0.00,
        notes: '',
        cashInBank: 0.00
      }
    ];

    for (const event of defaultEvents) {
      await sql`
        INSERT INTO events (name, date, course, status, playerCount, playerFee, courseFee, payments, surplus, notes, cashInBank)
        VALUES (${event.name}, ${event.date}, ${event.course}, ${event.status}, ${event.playerCount}, ${event.playerFee}, ${event.courseFee}, ${event.payments}, ${event.surplus}, ${event.notes}, ${event.cashInBank})
      `;
    }
    console.log('Default events seeded');
  }

  // User methods
  async authenticateUser(username, password) {
    try {
      const users = await sql`
        SELECT * FROM users 
        WHERE username = ${username} AND password = ${password}
      `;
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Event methods
  async getEvents() {
    try {
      const events = await sql`SELECT * FROM events ORDER BY date DESC`;
      // Parse JSON payments for each event
      return events.map(event => ({
        ...event,
        payments: typeof event.payments === 'string' ? JSON.parse(event.payments) : event.payments
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  async createEvent(eventData) {
    try {
      const {
        name,
        date,
        course,
        status = 'upcoming',
        playerCount = 0,
        playerFee = 0,
        courseFee = 0,
        payments = { bankTransfer: 0, cash: 0, card: 0 },
        surplus = 0,
        notes = '',
        cashInBank = 0
      } = eventData;

      const result = await sql`
        INSERT INTO events (name, date, course, status, playerCount, playerFee, courseFee, payments, surplus, notes, cashInBank)
        VALUES (${name}, ${date}, ${course}, ${status}, ${playerCount}, ${playerFee}, ${courseFee}, ${JSON.stringify(payments)}, ${surplus}, ${notes}, ${cashInBank})
        RETURNING *
      `;

      const event = result[0];
      return {
        ...event,
        payments: typeof event.payments === 'string' ? JSON.parse(event.payments) : event.payments
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id, updateData) {
    try {
      const {
        name,
        date,
        course,
        status,
        playerCount,
        playerFee,
        courseFee,
        payments,
        surplus,
        notes,
        cashInBank
      } = updateData;

      const result = await sql`
        UPDATE events 
        SET 
          name = ${name},
          date = ${date},
          course = ${course},
          status = ${status},
          playerCount = ${playerCount},
          playerFee = ${playerFee},
          courseFee = ${courseFee},
          payments = ${JSON.stringify(payments)},
          surplus = ${surplus},
          notes = ${notes},
          cashInBank = ${cashInBank}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        throw new Error('Event not found');
      }

      const event = result[0];
      return {
        ...event,
        payments: typeof event.payments === 'string' ? JSON.parse(event.payments) : event.payments
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id) {
    try {
      const result = await sql`
        DELETE FROM events 
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        throw new Error('Event not found');
      }

      const event = result[0];
      return {
        ...event,
        payments: typeof event.payments === 'string' ? JSON.parse(event.payments) : event.payments
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

module.exports = DataStore;
