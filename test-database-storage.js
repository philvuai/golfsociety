// Test script to check if database fields are being stored correctly
// Run this after deploying your changes

const testDatabaseStorage = async () => {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8888/.netlify/functions' 
    : 'https://your-site-name.netlify.app/.netlify/functions';

  try {
    console.log('🔍 Testing database storage...');
    
    // Fetch debug data
    const response = await fetch(`${baseUrl}/debug-events`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Debug data fetched successfully');
      console.log(`📊 Total events in database: ${data.debug.totalEvents}`);
      
      if (data.debug.rawEvents.length > 0) {
        console.log('\n🗃️ Raw database data (first event):');
        const firstEvent = data.debug.rawEvents[0];
        console.log('- player_group_1_name:', firstEvent.player_group_1_name);
        console.log('- player_group_2_name:', firstEvent.player_group_2_name);
        console.log('- player_count:', firstEvent.player_count);
        console.log('- player_count_2:', firstEvent.player_count_2);
        console.log('- player_fee:', firstEvent.player_fee);
        console.log('- player_fee_2:', firstEvent.player_fee_2);
        
        console.log('\n🔄 Mapped data (first event):');
        const firstMapped = data.debug.mappedEvents[0];
        console.log('- playerGroup1Name:', firstMapped.playerGroup1Name);
        console.log('- playerGroup2Name:', firstMapped.playerGroup2Name);
        console.log('- playerCount:', firstMapped.playerCount);
        console.log('- playerCount2:', firstMapped.playerCount2);
        console.log('- playerFee:', firstMapped.playerFee);
        console.log('- playerFee2:', firstMapped.playerFee2);
        
        // Check if the new fields are being stored
        if (firstEvent.player_group_1_name && firstEvent.player_group_2_name) {
          console.log('\n✅ Player group names are being stored in database!');
        } else {
          console.log('\n❌ Player group names are NOT being stored in database');
          console.log('This could mean:');
          console.log('1. The columns don\'t exist yet (need to deploy the schema changes)');
          console.log('2. Existing events were created before the new fields were added');
          console.log('3. The frontend isn\'t sending the data correctly');
        }
      } else {
        console.log('\n📝 No events found in database');
      }
    } else {
      console.error('❌ Failed to fetch debug data:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing database storage:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure you\'ve deployed your changes to Netlify');
    console.log('2. Update the baseUrl in this script with your actual Netlify site URL');
    console.log('3. Check that the debug-events.js function was deployed correctly');
  }
};

// Instructions for usage
console.log('🧪 Database Storage Test');
console.log('========================');
console.log('');
console.log('To use this script:');
console.log('1. Deploy your changes to Netlify first');
console.log('2. Update the baseUrl above with your actual Netlify site URL');
console.log('3. Run: node test-database-storage.js');
console.log('');
console.log('Running test now...');
console.log('');

testDatabaseStorage();
