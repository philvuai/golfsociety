const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get store instance according to Netlify Blobs documentation
    const store = getStore('test-store');
    
    if (event.httpMethod === 'POST') {
      // Test writing to blob storage
      const testData = {
        message: 'Hello from Netlify Blobs!',
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      // Store JSON data directly - Netlify Blobs handles serialization
      await store.set('test-key', JSON.stringify(testData), {
        metadata: { 
          type: 'test',
          timestamp: new Date().toISOString()
        }
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Data written to blob storage',
          data: testData
        })
      };
    } else {
      // Test reading from blob storage
      const data = await store.get('test-key', { type: 'json' });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Data read from blob storage',
          data: data || 'No data found'
        })
      };
    }
  } catch (error) {
    console.error('Blob storage test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      })
    };
  }
};
