const DataStore = require('./utils/dataStore');

// Authentication check - admin only for member management
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

  // Only admin users can access member management
  if (!user || user.role !== 'admin') {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Admin access required for member management' })
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Get all members or specific member by ID
        const memberId = event.queryStringParameters?.id;
        
        if (memberId) {
          const member = await dataStore.getMemberById(memberId);
          if (!member) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Member not found' })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, member })
          };
        } else {
          const members = await dataStore.getMembers();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, members })
          };
        }

      case 'POST':
        // Create new member
        const newMemberData = JSON.parse(event.body);
        
        // Validate required fields
        if (!newMemberData.name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Member name is required' })
          };
        }

        const newMember = await dataStore.createMember(newMemberData);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, member: newMember })
        };

      case 'PUT':
        // Update existing member
        const { id, ...updateData } = JSON.parse(event.body);
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Member ID is required' })
          };
        }

        // Validate required fields
        if (!updateData.name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Member name is required' })
          };
        }

        const updatedMember = await dataStore.updateMember(id, updateData);
        if (!updatedMember) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Member not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, member: updatedMember })
        };

      case 'DELETE':
        // Soft delete member (set active = false)
        const deleteId = event.queryStringParameters?.id;
        if (!deleteId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Member ID is required' })
          };
        }

        const deletedMember = await dataStore.deleteMember(deleteId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, member: deletedMember })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Members API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
