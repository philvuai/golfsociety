const DataStore = require('./utils/dataStore');

// Simple authentication check (in production, use JWT tokens)
const checkAuth = async (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return null;
  }

  try {
    // For now, we'll pass user info in the Authorization header
    // In production, you'd verify JWT tokens here
    const userInfo = JSON.parse(authHeader.replace('Bearer ', ''));
    return userInfo;
  } catch (error) {
    return null;
  }
};

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

  const dataStore = new DataStore();
  const user = await checkAuth(event);

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Both admin and viewer can get events
        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Authentication required' })
          };
        }

        const events = await dataStore.getEvents();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, events })
        };

      case 'POST':
        // Only admin can create events
        if (!user || user.role !== 'admin') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Admin access required' })
          };
        }

        const newEventData = JSON.parse(event.body);
        const newEvent = await dataStore.createEvent(newEventData);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, event: newEvent })
        };

      case 'PUT':
        // Only admin can update events
        if (!user || user.role !== 'admin') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Admin access required' })
          };
        }

        const { id, ...updateData } = JSON.parse(event.body);
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Event ID is required' })
          };
        }

        const updatedEvent = await dataStore.updateEvent(id, updateData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, event: updatedEvent })
        };

      case 'DELETE':
        // Only admin can delete events
        if (!user || user.role !== 'admin') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Admin access required' })
          };
        }

        const eventId = event.queryStringParameters?.id;
        if (!eventId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Event ID is required' })
          };
        }

        const deletedEvent = await dataStore.deleteEvent(eventId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, event: deletedEvent })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Events API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
