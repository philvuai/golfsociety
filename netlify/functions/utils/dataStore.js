

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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

// SQL for adding new columns - run separately to handle potential errors gracefully
const MIGRATION_SQL = `
ALTER TABLE events ADD COLUMN IF NOT EXISTS player_count2 INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS player_fee2 NUMERIC(10, 2) DEFAULT 0.00;
`;

// Function to initialize the database
async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    
    // First, create basic tables
    await client.query(CREATE_TABLES_SQL);
    
    // Then, try to add new columns if they don't exist
    try {
      await client.query(MIGRATION_SQL);
      console.log('Database migration completed successfully');
    } catch (migrationError) {
      console.log('Migration skipped (columns may already exist):', migrationError.message);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw the error - let the app continue even if migration fails
    console.log('Continuing with existing database structure...');
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Initialize the database when the application starts
initializeDatabase();

class DataStore {
  // Password Hashing methods
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

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
      const { name, date, location, status, playerCount, playerFee, playerCount2, playerFee2, courseFee, cashInBank, funds, surplus, notes } = eventData;
      
      // First try with new columns
      try {
        const result = await client.query(
          'INSERT INTO events (name, date, location, status, player_count, player_fee, player_count2, player_fee2, course_fee, cash_in_bank, funds, surplus, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
          [name, date, location, status, playerCount, playerFee, playerCount2 || 0, playerFee2 || 0, courseFee, cashInBank, funds, surplus, notes]
        );
        return result.rows[0];
      } catch (error) {
        // If new columns don't exist, fall back to old structure
        console.log('Falling back to legacy table structure for createEvent');
        const result = await client.query(
          'INSERT INTO events (name, date, location, status, player_count, player_fee, course_fee, cash_in_bank, funds, surplus, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
          [name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes]
        );
        return result.rows[0];
      }
    } finally {
      client.release();
    }
  }

  async updateEvent(id, updates) {
    const client = await pool.connect();
    try {
      const { name, date, location, status, playerCount, playerFee, playerCount2, playerFee2, courseFee, cashInBank, funds, surplus, notes } = updates;
      
      // First try with new columns
      try {
        const result = await client.query(
          'UPDATE events SET name = $1, date = $2, location = $3, status = $4, player_count = $5, player_fee = $6, player_count2 = $7, player_fee2 = $8, course_fee = $9, cash_in_bank = $10, funds = $11, surplus = $12, notes = $13, updated_at = CURRENT_TIMESTAMP WHERE id = $14 AND deleted_at IS NULL RETURNING *',
          [name, date, location, status, playerCount, playerFee, playerCount2 || 0, playerFee2 || 0, courseFee, cashInBank, funds, surplus, notes, id]
        );
        return result.rows[0];
      } catch (error) {
        // If new columns don't exist, fall back to old structure
        console.log('Falling back to legacy table structure for updateEvent');
        const result = await client.query(
          'UPDATE events SET name = $1, date = $2, location = $3, status = $4, player_count = $5, player_fee = $6, course_fee = $7, cash_in_bank = $8, funds = $9, surplus = $10, notes = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 AND deleted_at IS NULL RETURNING *',
          [name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes, id]
        );
        return result.rows[0];
      }
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
      // First get the user by username only
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        
        // Check if password is already hashed (contains $2 prefix for bcrypt)
        let isValidPassword = false;
        if (user.password_hash.startsWith('$2')) {
          // Password is hashed, use bcrypt compare
          isValidPassword = await this.comparePassword(password, user.password_hash);
        } else {
          // Password is plain text (legacy), do direct comparison
          isValidPassword = password === user.password_hash;
          
          // If valid, update to hashed password for future use
          if (isValidPassword) {
            const hashedPassword = await this.hashPassword(password);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);
          }
        }
        
        if (isValidPassword) {
          return {
            id: user.id,
            username: user.username,
            role: user.role,
            isAuthenticated: true
          };
        }
      }
      return null;
    } finally {
      client.release();
    }
  }
}

module.exports = DataStore;
