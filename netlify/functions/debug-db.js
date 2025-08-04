const DataStore = require('./utils/dataStore');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const dataStore = new DataStore();

  try {
    // Get all events from database
    const events = await dataStore.getEvents();
    
    // Test creating a simple event
    const testEventData = {
      name: 'Debug Test Event',
      date: new Date().toISOString(),
      location: 'Test Location',
      status: 'upcoming',
      players: [],
      playerCount: 5,
      playerFee: 25.50,
      courseFee: 100.00,
      cashInBank: 200.00,
      funds: { bankTransfer: 50.00, cash: 25.00, card: 52.50 },
      surplus: 27.50,
      notes: 'This is a debug test'
    };

    console.log('Creating test event with data:', JSON.stringify(testEventData, null, 2));
    const createdEvent = await dataStore.createEvent(testEventData);
    console.log('Created event result:', JSON.stringify(createdEvent, null, 2));

    // Get the created event by ID
    if (createdEvent && createdEvent.id) {
      const retrievedEvent = await dataStore.getEventById(createdEvent.id);
      console.log('Retrieved event:', JSON.stringify(retrievedEvent, null, 2));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Debug completed',
        totalEvents: events.length,
        events: events,
        testEvent: createdEvent
      })
    };

  } catch (error) {
    console.error('Debug DB error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message, 
        stack: error.stack 
      })
    };
  }
};
