const DataStore = require('./utils/dataStore');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const dataStore = new DataStore();
    
    // Test database connection and initialization
    console.log('🧪 Testing database connection...');
    
    // Check environment variables
    const envCheck = {
      NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    };
    
    console.log('Environment variables:', envCheck);
    
    if (!process.env.NEON_DATABASE_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'NEON_DATABASE_URL environment variable is not set',
          environment: envCheck,
          instructions: [
            '1. Go to your Netlify dashboard',
            '2. Navigate to Site settings > Environment variables',
            '3. Add NEON_DATABASE_URL with your Neon database connection string',
            '4. Format: postgresql://username:password@hostname/database_name?sslmode=require'
          ]
        })
      };
    }

    // Test basic database operations
    await dataStore.ensureDbInitialized();
    
    // Try to get events (this will test the full database connection)
    const events = await dataStore.getEvents();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database connection successful!',
        environment: envCheck,
        eventsCount: events.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: {
          name: error.name,
          stack: error.stack,
          code: error.code
        },
        troubleshooting: [
          'Check if NEON_DATABASE_URL is correctly set in Netlify environment variables',
          'Verify your Neon database is active and accessible',
          'Ensure the database URL includes ?sslmode=require',
          'Check if your Neon database has any IP restrictions',
          'Verify your database credentials are correct'
        ]
      })
    };
  }
};
