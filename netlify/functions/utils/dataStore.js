

const { Pool } = require('pg');

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// SQL for creating tables if they don't exist
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    status VARCHAR(50),
    player_count INTEGER,
    player_fee NUMERIC(10, 2),
    course_fee NUMERIC(10, 2),
    cash_in_bank NUMERIC(10, 2),
    funds JSONB,
    surplus NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Seed initial data if users table is empty
INSERT INTO users (username, password_hash, role)
SELECT 'admin', 'golfsociety2024', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password_hash, role)
SELECT 'viewer', 'viewonly2024', 'viewer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'viewer');
`;

// Function to initialize the database
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    await client.query(CREATE_TABLES_SQL);
    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize the database when the application starts
initializeDatabase();

class DataStore {
  async getEvents() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEventById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createEvent(eventData) {
    const client = await pool.connect();
    try {
      const { name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes } = eventData;
      const result = await client.query(
        'INSERT INTO events (name, date, location, status, player_count, player_fee, course_fee, cash_in_bank, funds, surplus, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateEvent(id, updates) {
    const client = await pool.connect();
    try {
      const { name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes } = updates;
      const result = await client.query(
        'UPDATE events SET name = $1, date = $2, location = $3, status = $4, player_count = $5, player_fee = $6, course_fee = $7, cash_in_bank = $8, funds = $9, surplus = $10, notes = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 AND deleted_at IS NULL RETURNING *',
        [name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteEvent(id) {
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async authenticateUser(username, password) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE username = $1 AND password_hash = $2', [username, password]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          isAuthenticated: true
        };
      }
      return null;
    } finally {
      client.release();
    }
  }
}

module.exports = DataStore;
