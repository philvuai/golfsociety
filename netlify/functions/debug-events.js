const DataStore = require('./utils/dataStore');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const dataStore = new DataStore();

  try {
    // Get raw database data to see what's actually stored
    await dataStore.ensureDbInitialized();
    
    // Use sql directly to get raw data
    const { neon } = require('@netlify/neon');
    const sql = neon();
    
    // Get all events with all columns
    const rawEvents = await sql`
      SELECT id, name, date, location, status, 
             player_count, player_fee, player_group_1_name,
             player_count_2, player_fee_2, player_group_2_name,
             course_fee, cash_in_bank, funds, surplus, notes,
             created_at, updated_at, deleted_at
      FROM events 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC
    `;

    // Also get the mapped events for comparison
    const mappedEvents = await dataStore.getEvents();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        debug: {
          rawEvents: rawEvents,
          mappedEvents: mappedEvents,
          totalEvents: rawEvents.length
        }
      })
    };

  } catch (error) {
    console.error('Debug events error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        stack: error.stack
      })
    };
  }
};
