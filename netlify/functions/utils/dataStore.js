const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Check if database URL is provided
if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL environment variable is not set');
  console.log('Please set NEON_DATABASE_URL in your environment variables');
  console.log('Example: postgresql://username:password@hostname/database_name?sslmode=require');
}

// Initialize the connection pool with better error handling
// Neon requires SSL connections
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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

class DataStore {
  constructor() {
    this.dbInitialized = false;
  }

  // Ensure database is initialized before any operation
  async ensureDbInitialized() {
    if (!this.dbInitialized) {
      try {
        if (!process.env.NEON_DATABASE_URL) {
          throw new Error('NEON_DATABASE_URL environment variable is not configured');
        }
        
        console.log('🔌 Connecting to Neon database...');
        const client = await pool.connect();
        
        // Test the connection
        await client.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        
        // Initialize tables
        console.log('📋 Creating tables if they don\'t exist...');
        await client.query(CREATE_TABLES_SQL);
        
        client.release();
        console.log('✅ Database initialized successfully');
        this.dbInitialized = true;
      } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        
        // Provide specific error messages for common issues
        if (error.code === 'ENOTFOUND') {
          console.error('🌐 Network error: Could not resolve database hostname');
        } else if (error.code === 'ECONNREFUSED') {
          console.error('🔌 Connection refused: Database server is not accessible');
        } else if (error.code === '28P01') {
          console.error('🔐 Authentication failed: Invalid username or password');
        } else if (error.code === '3D000') {
          console.error('🗃️ Database does not exist');
        }
        
        // Still mark as initialized to prevent infinite retries, but throw error
        this.dbInitialized = true;
        throw error;
      }
    }
  }
  // Password Hashing methods
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  async getEvents() {
    await this.ensureDbInitialized();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEventById(id) {
    await this.ensureDbInitialized();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createEvent(eventData) {
    await this.ensureDbInitialized();
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
    await this.ensureDbInitialized();
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
    await this.ensureDbInitialized();
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async authenticateUser(username, password) {
    await this.ensureDbInitialized();
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
