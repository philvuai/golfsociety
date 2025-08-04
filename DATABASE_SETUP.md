# Golf Society Database Setup Guide

## 🔧 Fixing the 500 Database Connection Error

The 500 error you're experiencing is likely due to the Neon database not being properly configured. Here's how to fix it:

### 1. Check Your Neon Database

First, ensure your Neon database is set up and accessible:

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Copy the connection string from your database dashboard
4. It should look like: `postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/golfsociety?sslmode=require`

### 2. Set Environment Variables

#### For Local Development:
1. Update the `.env` file in your project root:
```bash
NEON_DATABASE_URL=postgresql://your_username:your_password@your_host/your_database?sslmode=require
NODE_ENV=development
```

#### For Netlify Production:
1. Go to your Netlify dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add a new variable:
   - **Key**: `NEON_DATABASE_URL`
   - **Value**: Your full Neon connection string

### 3. Test the Database Connection

I've created a test function to help diagnose issues:

```bash
# Test locally (if you have netlify-cli installed)
netlify dev

# Then visit: http://localhost:8888/.netlify/functions/test-db
```

Or test the deployed version:
```
https://your-site.netlify.app/.netlify/functions/test-db
```

### 4. Common Issues and Solutions

#### ❌ "NEON_DATABASE_URL environment variable is not set"
**Solution**: Set the environment variable in Netlify dashboard or your local `.env` file.

#### ❌ "Network error: Could not resolve database hostname"
**Solution**: Check your internet connection and verify the hostname in your connection string.

#### ❌ "Authentication failed: Invalid username or password"
**Solution**: Verify your Neon database credentials. You can reset them in the Neon console.

#### ❌ "Database does not exist"
**Solution**: Make sure the database name in your connection string matches your Neon database.

#### ❌ SSL/TLS Connection Issues
**Solution**: Ensure your connection string includes `?sslmode=require` at the end.

### 5. Database Schema

The application automatically creates these tables on first connection:

- **users**: Stores admin and viewer credentials
- **events**: Golf society event data

Default login credentials:
- **Admin**: username=`admin`, password=`golfsociety2024`
- **Viewer**: username=`viewer`, password=`viewonly2024`

### 6. Manual Database Setup

If you need to set up the database manually, run:

```bash
npm run setup
```

This will:
1. Prompt you for your Neon database URL
2. Update your local `.env` file
3. Show you the next steps

### 7. Verifying the Fix

After setting up your environment variables:

1. **Test the connection**: Visit `/api/test-db` endpoint
2. **Test authentication**: Try logging in with admin credentials
3. **Check logs**: Look at Netlify function logs for any remaining errors

### 8. Production Deployment Checklist

- [ ] Neon database is created and active
- [ ] `NEON_DATABASE_URL` is set in Netlify environment variables
- [ ] Connection string includes `?sslmode=require`
- [ ] Database is accessible from Netlify (no IP restrictions)
- [ ] Functions are deployed successfully

### Need Help?

If you're still experiencing issues:

1. Check the Netlify function logs for specific error messages
2. Use the test endpoints to diagnose the problem
3. Verify your Neon database is not in sleep mode (for free tier)
4. Ensure your Neon project hasn't exceeded usage limits

The database connection has been improved with:
- Better error handling and logging
- Automatic SSL configuration for Neon
- Connection pooling with appropriate timeouts
- Detailed error messages for common issues
