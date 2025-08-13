const DataStore = require('./utils/dataStore');

// Authentication check - admin only for participant management
const checkAuth = async (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return null;
  }

  try {
    // Parse user info from Authorization header
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

  // Only admin users can manage event participants
  if (!user || user.role !== 'admin') {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Admin access required for participant management' })
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Get participants for an event
        const eventId = event.queryStringParameters?.eventId;
        
        if (!eventId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Event ID is required' })
          };
        }

        const participants = await dataStore.getEventParticipants(eventId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, participants })
        };

      case 'POST':
        // Add participant to event
        const { eventId: postEventId, memberId, ...participantData } = JSON.parse(event.body);
        
        if (!postEventId || !memberId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Event ID and Member ID are required' })
          };
        }

        const newParticipant = await dataStore.addParticipantToEvent(postEventId, memberId, participantData);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, participant: newParticipant })
        };

      case 'PUT':
        // Update participant details
        const { participantId, ...updateData } = JSON.parse(event.body);
        
        if (!participantId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Participant ID is required' })
          };
        }

        const updatedParticipant = await dataStore.updateParticipant(participantId, updateData);
        if (!updatedParticipant) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Participant not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, participant: updatedParticipant })
        };

      case 'DELETE':
        // Remove participant from event
        const removeEventId = event.queryStringParameters?.eventId;
        const removeMemberId = event.queryStringParameters?.memberId;
        
        if (!removeEventId || !removeMemberId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Event ID and Member ID are required' })
          };
        }

        const removedParticipant = await dataStore.removeParticipantFromEvent(removeEventId, removeMemberId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, participant: removedParticipant })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Event Participants API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
