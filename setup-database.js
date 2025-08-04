#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupDatabase() {
  console.log('\n🏌️ Golf Society Database Setup\n');
  console.log('This script will help you configure your Neon database connection.\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    console.log('✅ Found existing .env file');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('your_neon_database_url_here')) {
      console.log('⚠️  .env file needs to be configured with your Neon database URL\n');
    } else {
      console.log('✅ .env file appears to be configured\n');
    }
  } else {
    console.log('❌ No .env file found. Please create one from .env.example\n');
  }

  return new Promise((resolve) => {
    rl.question('Enter your Neon database URL (or press Enter to skip): ', (answer) => {
      if (answer.trim()) {
        // Update .env file
        const envContent = `# Local Development Environment
NODE_ENV=development

# Netlify Neon Database URL
NETLIFY_DATABASE_URL=${answer.trim()}
`;
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ Updated .env file with your database URL');
      }

      console.log('\n📋 Current Login Credentials:');
      console.log('Admin - Username: admin, Password: golfsociety2024');
      console.log('Viewer - Username: viewer, Password: viewonly2024');
      console.log('\n🔒 These passwords will be automatically hashed when you first log in.');
      console.log('\n📝 Next steps:');
      console.log('1. Make sure your Neon database is created and accessible');
      console.log('2. Set the NETLIFY_DATABASE_URL environment variable in Netlify dashboard');
      console.log('3. Test authentication by running the application');
      console.log('4. The database tables will be created automatically on first run');

      rl.close();
      resolve();
    });
  });
}

setupDatabase().then(() => {
  console.log('\n🎉 Setup complete!');
});
