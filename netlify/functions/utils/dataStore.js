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
              player_count_2 INTEGER DEFAULT 0,
              player_fee_2 NUMERIC(10, 2) DEFAULT 0,
              levy_1_name VARCHAR(255) DEFAULT 'Leicestershire',
              levy_1_value NUMERIC(10, 2) DEFAULT 0,
              levy_2_name VARCHAR(255) DEFAULT 'Regional',
              levy_2_value NUMERIC(10, 2) DEFAULT 0,
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
        
        // Add new columns to existing events table if they don't exist
        await sql`
          ALTER TABLE events 
          ADD COLUMN IF NOT EXISTS player_count_2 INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS player_fee_2 NUMERIC(10, 2) DEFAULT 0,
          ADD COLUMN IF NOT EXISTS player_group_1_name VARCHAR(255) DEFAULT 'Members',
          ADD COLUMN IF NOT EXISTS player_group_2_name VARCHAR(255) DEFAULT 'Guests',
          ADD COLUMN IF NOT EXISTS levy_1_name VARCHAR(255) DEFAULT 'Leicestershire',
          ADD COLUMN IF NOT EXISTS levy_1_value NUMERIC(10, 2) DEFAULT 0,
          ADD COLUMN IF NOT EXISTS levy_2_name VARCHAR(255) DEFAULT 'Regional',
          ADD COLUMN IF NOT EXISTS levy_2_value NUMERIC(10, 2) DEFAULT 0
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
        
        // Create members table
        await sql`
          CREATE TABLE IF NOT EXISTS members (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255),
              handicap NUMERIC(3, 1),
              phone VARCHAR(20),
              membership_number VARCHAR(50),
              joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        // Create event_participants table
        await sql`
          CREATE TABLE IF NOT EXISTS event_participants (
              id SERIAL PRIMARY KEY,
              event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
              member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
              member_group VARCHAR(20) DEFAULT 'members',
              payment_status VARCHAR(20) DEFAULT 'unpaid',
              payment_method VARCHAR(20),
              player_fee NUMERIC(10, 2) DEFAULT 0,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(event_id, member_id)
          )
        `;
        
        // Update existing event_participants table to use new schema
        await sql`
          ALTER TABLE event_participants 
          ADD COLUMN IF NOT EXISTS member_group VARCHAR(20) DEFAULT 'members',
          ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid',
          ADD COLUMN IF NOT EXISTS player_fee NUMERIC(10, 2) DEFAULT 0
        `;
        
        // Migrate old data to new schema if columns exist
        await sql`
          UPDATE event_participants 
          SET payment_status = CASE 
                                 WHEN has_paid = true THEN 'paid'
                                 ELSE 'unpaid'
                               END
          WHERE payment_status IS NULL AND has_paid IS NOT NULL
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

  // Map database event format (snake_case) to frontend format (camelCase)
  mapDbEventToFrontend(dbEvent) {
    if (!dbEvent) return null;
    
    // Parse funds JSON if it's a string
    let funds;
    if (typeof dbEvent.funds === 'string') {
      try {
        funds = JSON.parse(dbEvent.funds);
      } catch (e) {
        funds = { bankTransfer: 0, cash: 0, card: 0 };
      }
    } else {
      funds = dbEvent.funds || { bankTransfer: 0, cash: 0, card: 0 };
    }

    return {
      id: String(dbEvent.id),
      name: dbEvent.name || '',
      date: dbEvent.date,
      location: dbEvent.location || '',
      status: dbEvent.status || 'upcoming',
      players: [], // Not stored in DB currently
      playerCount: Number(dbEvent.player_count) || 0,
      playerFee: Number(dbEvent.player_fee) || 0,
      playerGroup1Name: dbEvent.player_group_1_name || 'Members',
      playerCount2: Number(dbEvent.player_count_2) || 0,
      playerFee2: Number(dbEvent.player_fee_2) || 0,
      playerGroup2Name: dbEvent.player_group_2_name || 'Guests',
      levy1Name: dbEvent.levy_1_name || 'Leicestershire',
      levy1Value: Number(dbEvent.levy_1_value) || 0,
      levy2Name: dbEvent.levy_2_name || 'Regional',
      levy2Value: Number(dbEvent.levy_2_value) || 0,
      courseFee: Number(dbEvent.course_fee) || 0,
      cashInBank: Number(dbEvent.cash_in_bank) || 0,
      funds: funds,
      surplus: Number(dbEvent.surplus) || 0,
      notes: dbEvent.notes || '',
      createdAt: dbEvent.created_at,
      updatedAt: dbEvent.updated_at,
      deletedAt: dbEvent.deleted_at
    };
  }

  async getEvents() {
    await this.ensureDbInitialized();
    const result = await sql`SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC`;
    // Convert database format to frontend format
    return result.map(event => this.mapDbEventToFrontend(event));
  }

  async getEventById(id) {
    await this.ensureDbInitialized();
    const result = await sql`SELECT * FROM events WHERE id = ${id} AND deleted_at IS NULL`;
    return result[0] ? this.mapDbEventToFrontend(result[0]) : null;
  }

  async createEvent(eventData) {
    await this.ensureDbInitialized();
    const { name, date, location, status, playerCount, playerFee, playerGroup1Name, playerCount2, playerFee2, playerGroup2Name, levy1Name, levy1Value, levy2Name, levy2Value, courseFee, cashInBank, funds, surplus, notes } = eventData;
    // Ensure funds is properly serialized as JSON
    const fundsJson = JSON.stringify(funds || { bankTransfer: 0, cash: 0, card: 0 });
    
    const result = await sql`
      INSERT INTO events (name, date, location, status, player_count, player_fee, player_group_1_name, player_count_2, player_fee_2, player_group_2_name, levy_1_name, levy_1_value, levy_2_name, levy_2_value, course_fee, cash_in_bank, funds, surplus, notes) 
      VALUES (${name}, ${date}, ${location}, ${status}, ${playerCount || 0}, ${playerFee || 0}, ${playerGroup1Name || 'Members'}, ${playerCount2 || 0}, ${playerFee2 || 0}, ${playerGroup2Name || 'Guests'}, ${levy1Name || 'Leicestershire'}, ${levy1Value || 0}, ${levy2Name || 'Regional'}, ${levy2Value || 0}, ${courseFee || 0}, ${cashInBank || 0}, ${fundsJson}, ${surplus || 0}, ${notes || ''}) 
      RETURNING *
    `;
    return this.mapDbEventToFrontend(result[0]);
  }

  async updateEvent(id, updates) {
    await this.ensureDbInitialized();
    const { name, date, location, status, playerCount, playerFee, playerGroup1Name, playerCount2, playerFee2, playerGroup2Name, levy1Name, levy1Value, levy2Name, levy2Value, courseFee, cashInBank, funds, surplus, notes } = updates;
    // Ensure funds is properly serialized as JSON
    const fundsJson = JSON.stringify(funds || { bankTransfer: 0, cash: 0, card: 0 });
    
    const result = await sql`
      UPDATE events 
      SET name = ${name}, date = ${date}, location = ${location}, status = ${status}, player_count = ${playerCount || 0}, 
          player_fee = ${playerFee || 0}, player_group_1_name = ${playerGroup1Name || 'Members'}, player_count_2 = ${playerCount2 || 0}, player_fee_2 = ${playerFee2 || 0}, 
          player_group_2_name = ${playerGroup2Name || 'Guests'}, levy_1_name = ${levy1Name || 'Leicestershire'}, levy_1_value = ${levy1Value || 0}, 
          levy_2_name = ${levy2Name || 'Regional'}, levy_2_value = ${levy2Value || 0}, course_fee = ${courseFee || 0}, cash_in_bank = ${cashInBank || 0}, funds = ${fundsJson}, 
          surplus = ${surplus || 0}, notes = ${notes || ''}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} AND deleted_at IS NULL 
      RETURNING *
    `;
    return this.mapDbEventToFrontend(result[0]);
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

  // Member Management Methods
  mapDbMemberToFrontend(dbMember) {
    if (!dbMember) return null;
    
    return {
      id: String(dbMember.id),
      name: dbMember.name || '',
      email: dbMember.email || '',
      handicap: dbMember.handicap ? Number(dbMember.handicap) : undefined,
      phone: dbMember.phone || '',
      membershipNumber: dbMember.membership_number || '',
      joinedDate: dbMember.joined_date,
      active: Boolean(dbMember.active),
      createdAt: dbMember.created_at,
      updatedAt: dbMember.updated_at
    };
  }

  async getMembers() {
    await this.ensureDbInitialized();
    const result = await sql`SELECT * FROM members WHERE active = true ORDER BY name ASC`;
    return result.map(member => this.mapDbMemberToFrontend(member));
  }

  async getMemberById(id) {
    await this.ensureDbInitialized();
    const result = await sql`SELECT * FROM members WHERE id = ${id} AND active = true`;
    return result[0] ? this.mapDbMemberToFrontend(result[0]) : null;
  }

  async createMember(memberData) {
    await this.ensureDbInitialized();
    const { name, email, handicap, phone, membershipNumber } = memberData;
    
    const result = await sql`
      INSERT INTO members (name, email, handicap, phone, membership_number) 
      VALUES (${name}, ${email || null}, ${handicap || null}, ${phone || null}, ${membershipNumber || null}) 
      RETURNING *
    `;
    return this.mapDbMemberToFrontend(result[0]);
  }

  async updateMember(id, updates) {
    await this.ensureDbInitialized();
    const { name, email, handicap, phone, membershipNumber, active } = updates;
    
    const result = await sql`
      UPDATE members 
      SET name = ${name}, email = ${email || null}, handicap = ${handicap || null}, 
          phone = ${phone || null}, membership_number = ${membershipNumber || null}, 
          active = ${active !== undefined ? active : true}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
    return this.mapDbMemberToFrontend(result[0]);
  }

  async deleteMember(id) {
    await this.ensureDbInitialized();
    // Soft delete by setting active to false
    const result = await sql`
      UPDATE members 
      SET active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
    return result[0];
  }

  // Event Participants Methods
  mapDbParticipantToFrontend(dbParticipant) {
    if (!dbParticipant) return null;
    
    return {
      id: String(dbParticipant.id),
      eventId: String(dbParticipant.event_id),
      memberId: String(dbParticipant.member_id),
      memberGroup: dbParticipant.member_group || 'members',
      paymentStatus: dbParticipant.payment_status || 'unpaid',
      paymentMethod: dbParticipant.payment_method || undefined,
      playerFee: Number(dbParticipant.player_fee) || 0,
      notes: dbParticipant.notes || '',
      createdAt: dbParticipant.created_at,
      updatedAt: dbParticipant.updated_at,
      member: dbParticipant.member_name ? {
        id: String(dbParticipant.member_id),
        name: dbParticipant.member_name,
        email: dbParticipant.member_email,
        handicap: dbParticipant.member_handicap ? Number(dbParticipant.member_handicap) : undefined,
        phone: dbParticipant.member_phone,
        membershipNumber: dbParticipant.member_membership_number,
        joinedDate: dbParticipant.member_joined_date,
        active: Boolean(dbParticipant.member_active)
      } : undefined
    };
  }

  async getEventParticipants(eventId) {
    await this.ensureDbInitialized();
    const result = await sql`
      SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap, 
             m.phone as member_phone, m.membership_number as member_membership_number, 
             m.joined_date as member_joined_date, m.active as member_active
      FROM event_participants ep
      JOIN members m ON ep.member_id = m.id
      WHERE ep.event_id = ${eventId}
      ORDER BY m.name ASC
    `;
    return result.map(participant => this.mapDbParticipantToFrontend(participant));
  }

  async addParticipantToEvent(eventId, memberId, participantData = {}) {
    await this.ensureDbInitialized();
    const { memberGroup = 'members', paymentStatus = 'unpaid', paymentMethod, playerFee = 0, notes } = participantData;
    
    const result = await sql`
      INSERT INTO event_participants (event_id, member_id, member_group, payment_status, payment_method, player_fee, notes) 
      VALUES (${eventId}, ${memberId}, ${memberGroup}, ${paymentStatus}, ${paymentMethod || null}, ${playerFee}, ${notes || ''}) 
      ON CONFLICT (event_id, member_id) 
      DO UPDATE SET member_group = ${memberGroup}, payment_status = ${paymentStatus}, 
                    payment_method = ${paymentMethod || null}, player_fee = ${playerFee}, notes = ${notes || ''}, 
                    updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    // Get the participant with member details
    const participantWithMember = await sql`
      SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap, 
             m.phone as member_phone, m.membership_number as member_membership_number, 
             m.joined_date as member_joined_date, m.active as member_active
      FROM event_participants ep
      JOIN members m ON ep.member_id = m.id
      WHERE ep.id = ${result[0].id}
    `;
    
    return this.mapDbParticipantToFrontend(participantWithMember[0]);
  }

  async updateParticipant(participantId, updates) {
    await this.ensureDbInitialized();
    const { memberGroup, paymentStatus, paymentMethod, playerFee, notes } = updates;
    
    const result = await sql`
      UPDATE event_participants 
      SET member_group = ${memberGroup || 'members'}, payment_status = ${paymentStatus || 'unpaid'}, 
          payment_method = ${paymentMethod || null}, player_fee = ${playerFee || 0}, notes = ${notes || ''}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${participantId} 
      RETURNING *
    `;
    
    // Get the participant with member details
    const participantWithMember = await sql`
      SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap, 
             m.phone as member_phone, m.membership_number as member_membership_number, 
             m.joined_date as member_joined_date, m.active as member_active
      FROM event_participants ep
      JOIN members m ON ep.member_id = m.id
      WHERE ep.id = ${result[0].id}
    `;
    
    return this.mapDbParticipantToFrontend(participantWithMember[0]);
  }

  async removeParticipantFromEvent(eventId, memberId) {
    await this.ensureDbInitialized();
    const result = await sql`
      DELETE FROM event_participants 
      WHERE event_id = ${eventId} AND member_id = ${memberId} 
      RETURNING *
    `;
    return result[0];
  }
}

module.exports = DataStore;
