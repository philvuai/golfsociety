const { neon } = require('@netlify/neon');
const bcrypt = require('bcryptjs');

// Check if database URL is provided
if (!process.env.NETLIFY_DATABASE_URL) {
  console.error('❌ NETLIFY_DATABASE_URL environment variable is not set');
  console.log('Please set NETLIFY_DATABASE_URL in your Netlify environment variables');
  console.log('This should be configured automatically when you connect Neon to Netlify');
}

// Initialize Netlify Neon connection
const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL

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
        if (!process.env.NETLIFY_DATABASE_URL) {
          throw new Error('NETLIFY_DATABASE_URL environment variable is not configured');
        }
        
        console.log('🔌 Connecting to Neon database...');
        
        // Test the connection
        await sql`SELECT NOW()`;
        console.log('✅ Database connection successful');
        
        // Initialize tables - split into individual statements for Netlify Neon
        console.log('📋 Creating tables if they don\'t exist...');
        
        // Create users table
        await sql`
          CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        // Create events table
        await sql`
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
          )
        `;
        
        // Seed initial users
        await sql`
          INSERT INTO users (username, password_hash, role)
          SELECT 'admin', 'golfsociety2024', 'admin'
          WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
        `;
        
        await sql`
          INSERT INTO users (username, password_hash, role)
          SELECT 'viewer', 'viewonly2024', 'viewer'
          WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'viewer')
        `;
        
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
    const result = await sql`SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC`;
    return result;
  }

  async getEventById(id) {
    await this.ensureDbInitialized();
    const result = await sql`SELECT * FROM events WHERE id = ${id} AND deleted_at IS NULL`;
    return result[0];
  }

  async createEvent(eventData) {
    await this.ensureDbInitialized();
    const { name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes } = eventData;
    const result = await sql`
      INSERT INTO events (name, date, location, status, player_count, player_fee, course_fee, cash_in_bank, funds, surplus, notes) 
      VALUES (${name}, ${date}, ${location}, ${status}, ${playerCount}, ${playerFee}, ${courseFee}, ${cashInBank}, ${funds}, ${surplus}, ${notes}) 
      RETURNING *
    `;
    return result[0];
  }

  async updateEvent(id, updates) {
    await this.ensureDbInitialized();
    const { name, date, location, status, playerCount, playerFee, courseFee, cashInBank, funds, surplus, notes } = updates;
    const result = await sql`
      UPDATE events 
      SET name = ${name}, date = ${date}, location = ${location}, status = ${status}, player_count = ${playerCount}, 
          player_fee = ${playerFee}, course_fee = ${courseFee}, cash_in_bank = ${cashInBank}, funds = ${funds}, 
          surplus = ${surplus}, notes = ${notes}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} AND deleted_at IS NULL 
      RETURNING *
    `;
    return result[0];
  }

  async deleteEvent(id) {
    await this.ensureDbInitialized();
    const result = await sql`
      UPDATE events 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
    return result[0];
  }

  async authenticateUser(username, password) {
    await this.ensureDbInitialized();
    // First get the user by username only
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (result.length > 0) {
      const user = result[0];

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
          await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${user.id}`;
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
  }
}

module.exports = DataStore;
