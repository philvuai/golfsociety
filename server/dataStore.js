const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://golfsociety:golfsociety2024@localhost/golfsociety',
});

class DataStore {
  constructor() {
    this.pool = pool;
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  mapDbEventToFrontend(dbEvent) {
    if (!dbEvent) return null;

    let funds;
    if (typeof dbEvent.funds === 'string') {
      try { funds = JSON.parse(dbEvent.funds); } catch (e) { funds = { bankTransfer: 0, cash: 0, card: 0 }; }
    } else {
      funds = dbEvent.funds || { bankTransfer: 0, cash: 0, card: 0 };
    }

    return {
      id: String(dbEvent.id),
      name: dbEvent.name || '',
      date: dbEvent.date,
      location: dbEvent.location || '',
      status: dbEvent.status || 'upcoming',
      players: [],
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
    const result = await this.query('SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC');
    return result.rows.map(event => this.mapDbEventToFrontend(event));
  }

  async getEventById(id) {
    const result = await this.query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0] ? this.mapDbEventToFrontend(result.rows[0]) : null;
  }

  async createEvent(eventData) {
    const { name, date, location, status, playerCount, playerFee, playerGroup1Name, playerCount2, playerFee2, playerGroup2Name, levy1Name, levy1Value, levy2Name, levy2Value, courseFee, cashInBank, funds, surplus, notes } = eventData;
    const fundsJson = JSON.stringify(funds || { bankTransfer: 0, cash: 0, card: 0 });

    const result = await this.query(
      `INSERT INTO events (name, date, location, status, player_count, player_fee, player_group_1_name, player_count_2, player_fee_2, player_group_2_name, levy_1_name, levy_1_value, levy_2_name, levy_2_value, course_fee, cash_in_bank, funds, surplus, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [name, date, location, status, playerCount || 0, playerFee || 0, playerGroup1Name || 'Members', playerCount2 || 0, playerFee2 || 0, playerGroup2Name || 'Guests', levy1Name || 'Leicestershire', levy1Value || 0, levy2Name || 'Regional', levy2Value || 0, courseFee || 0, cashInBank || 0, fundsJson, surplus || 0, notes || '']
    );
    return this.mapDbEventToFrontend(result.rows[0]);
  }

  async updateEvent(id, updates) {
    const { name, date, location, status, playerCount, playerFee, playerGroup1Name, playerCount2, playerFee2, playerGroup2Name, levy1Name, levy1Value, levy2Name, levy2Value, courseFee, cashInBank, funds, surplus, notes } = updates;
    const fundsJson = JSON.stringify(funds || { bankTransfer: 0, cash: 0, card: 0 });

    const result = await this.query(
      `UPDATE events SET name=$1, date=$2, location=$3, status=$4, player_count=$5, player_fee=$6, player_group_1_name=$7, player_count_2=$8, player_fee_2=$9, player_group_2_name=$10, levy_1_name=$11, levy_1_value=$12, levy_2_name=$13, levy_2_value=$14, course_fee=$15, cash_in_bank=$16, funds=$17, surplus=$18, notes=$19, updated_at=CURRENT_TIMESTAMP WHERE id=$20 AND deleted_at IS NULL RETURNING *`,
      [name, date, location, status, playerCount || 0, playerFee || 0, playerGroup1Name || 'Members', playerCount2 || 0, playerFee2 || 0, playerGroup2Name || 'Guests', levy1Name || 'Leicestershire', levy1Value || 0, levy2Name || 'Regional', levy2Value || 0, courseFee || 0, cashInBank || 0, fundsJson, surplus || 0, notes || '', id]
    );
    return this.mapDbEventToFrontend(result.rows[0]);
  }

  async deleteEvent(id) {
    const result = await this.query('UPDATE events SET deleted_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
  }

  async authenticateUser(username, password) {
    const result = await this.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      let isValidPassword = false;

      if (user.password_hash.startsWith('$2')) {
        isValidPassword = await this.comparePassword(password, user.password_hash);
      } else {
        isValidPassword = password === user.password_hash;
        if (isValidPassword) {
          const hashedPassword = await this.hashPassword(password);
          await this.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);
        }
      }

      if (isValidPassword) {
        return { id: user.id, username: user.username, role: user.role, isAuthenticated: true };
      }
    }
    return null;
  }

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
    const result = await this.query('SELECT * FROM members WHERE active = true ORDER BY name ASC');
    return result.rows.map(m => this.mapDbMemberToFrontend(m));
  }

  async getMemberById(id) {
    const result = await this.query('SELECT * FROM members WHERE id = $1 AND active = true', [id]);
    return result.rows[0] ? this.mapDbMemberToFrontend(result.rows[0]) : null;
  }

  async createMember(memberData) {
    const { name, email, handicap, phone, membershipNumber } = memberData;
    const result = await this.query(
      'INSERT INTO members (name, email, handicap, phone, membership_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email || null, handicap || null, phone || null, membershipNumber || null]
    );
    return this.mapDbMemberToFrontend(result.rows[0]);
  }

  async updateMember(id, updates) {
    const { name, email, handicap, phone, membershipNumber, active } = updates;
    const result = await this.query(
      'UPDATE members SET name=$1, email=$2, handicap=$3, phone=$4, membership_number=$5, active=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [name, email || null, handicap || null, phone || null, membershipNumber || null, active !== undefined ? active : true, id]
    );
    return this.mapDbMemberToFrontend(result.rows[0]);
  }

  async deleteMember(id) {
    const result = await this.query('UPDATE members SET active=false, updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
  }

  mapDbParticipantToFrontend(dbP) {
    if (!dbP) return null;
    return {
      id: String(dbP.id),
      eventId: String(dbP.event_id),
      memberId: String(dbP.member_id),
      memberGroup: dbP.member_group || 'members',
      paymentStatus: dbP.payment_status || 'unpaid',
      paymentMethod: dbP.payment_method || undefined,
      playerFee: Number(dbP.player_fee) || 0,
      notes: dbP.notes || '',
      createdAt: dbP.created_at,
      updatedAt: dbP.updated_at,
      member: dbP.member_name ? {
        id: String(dbP.member_id),
        name: dbP.member_name,
        email: dbP.member_email,
        handicap: dbP.member_handicap ? Number(dbP.member_handicap) : undefined,
        phone: dbP.member_phone,
        membershipNumber: dbP.member_membership_number,
        joinedDate: dbP.member_joined_date,
        active: Boolean(dbP.member_active)
      } : undefined
    };
  }

  async getEventParticipants(eventId) {
    const result = await this.query(
      `SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap,
              m.phone as member_phone, m.membership_number as member_membership_number,
              m.joined_date as member_joined_date, m.active as member_active
       FROM event_participants ep JOIN members m ON ep.member_id = m.id
       WHERE ep.event_id = $1 ORDER BY m.name ASC`, [eventId]
    );
    return result.rows.map(p => this.mapDbParticipantToFrontend(p));
  }

  async addParticipantToEvent(eventId, memberId, participantData = {}) {
    const { memberGroup = 'members', paymentStatus = 'unpaid', paymentMethod, playerFee = 0, notes } = participantData;
    const result = await this.query(
      `INSERT INTO event_participants (event_id, member_id, member_group, payment_status, payment_method, player_fee, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_id, member_id) DO UPDATE SET member_group=$3, payment_status=$4, payment_method=$5, player_fee=$6, notes=$7, updated_at=CURRENT_TIMESTAMP
       RETURNING *`,
      [eventId, memberId, memberGroup, paymentStatus, paymentMethod || null, playerFee, notes || '']
    );

    const withMember = await this.query(
      `SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap,
              m.phone as member_phone, m.membership_number as member_membership_number,
              m.joined_date as member_joined_date, m.active as member_active
       FROM event_participants ep JOIN members m ON ep.member_id = m.id WHERE ep.id = $1`, [result.rows[0].id]
    );
    return this.mapDbParticipantToFrontend(withMember.rows[0]);
  }

  async updateParticipant(participantId, updates) {
    const { memberGroup, paymentStatus, paymentMethod, playerFee, notes } = updates;
    const result = await this.query(
      `UPDATE event_participants SET member_group=$1, payment_status=$2, payment_method=$3, player_fee=$4, notes=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
      [memberGroup || 'members', paymentStatus || 'unpaid', paymentMethod || null, playerFee || 0, notes || '', participantId]
    );

    const withMember = await this.query(
      `SELECT ep.*, m.name as member_name, m.email as member_email, m.handicap as member_handicap,
              m.phone as member_phone, m.membership_number as member_membership_number,
              m.joined_date as member_joined_date, m.active as member_active
       FROM event_participants ep JOIN members m ON ep.member_id = m.id WHERE ep.id = $1`, [result.rows[0].id]
    );
    return this.mapDbParticipantToFrontend(withMember.rows[0]);
  }

  async removeParticipantFromEvent(eventId, memberId) {
    const result = await this.query('DELETE FROM event_participants WHERE event_id=$1 AND member_id=$2 RETURNING *', [eventId, memberId]);
    return result.rows[0];
  }
}

module.exports = DataStore;
