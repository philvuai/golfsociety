# Golf Society Admin Dashboard

A React-based admin dashboard for managing golf society events with secure authentication and Neon PostgreSQL database integration.

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup (Neon PostgreSQL)

1. Create a new database on [Neon](https://neon.tech)
2. Copy your connection string
3. Run the setup script:
   ```bash
   node setup-database.js
   ```
4. Or manually create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Neon database URL:
   ```
   NEON_DATABASE_URL=postgresql://username:password@hostname/database_name?sslmode=require
   ```

### 3. Authentication

**Default Login Credentials:**
- **Admin**: Username: `admin`, Password: `golfsociety2024`
- **Viewer**: Username: `viewer`, Password: `viewonly2024`

**Security Features:**
- Passwords are automatically hashed using bcrypt on first login
- Secure password storage in PostgreSQL
- Role-based access control (admin/viewer)

### 4. Environment Variables

**For Local Development:**
Create a `.env` file with:
```
NODE_ENV=development
NEON_DATABASE_URL=your_neon_database_connection_string
```

**For Production (Netlify):**
Add environment variables in your Netlify dashboard:
- `NEON_DATABASE_URL`: Your Neon database connection string

## 🚀 Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
