# Netlify Blob Storage Implementation

## Overview
This Golf Society admin dashboard now uses **Netlify Blob** for persistent data storage. This provides:

✅ **Permanent persistence** - Data survives function cold starts  
✅ **No third-party dependencies** - Native Netlify feature  
✅ **Global distribution** - Fast access worldwide  
✅ **Automatic backups** - Built-in data protection  
✅ **Cost-effective** - Generous free tier  

## How It Works

### Data Storage Structure
```
Blob Store: "golf-society-data"
└── Key: "application-data"
    └── JSON Data:
        ├── events[]
        ├── users[]
        └── lastUpdated
```

### Key Components

1. **DataStore Class** (`netlify/functions/utils/dataStore.js`)
   - Handles all blob read/write operations
   - Provides methods for CRUD operations on events
   - Manages user authentication data

2. **Blob Configuration**
   - Store Name: `golf-society-data`
   - Data Key: `application-data`
   - Format: JSON

3. **Automatic Initialization**
   - On first run, creates default data structure
   - Includes sample event and admin/viewer users

## Benefits Over Previous Implementation

| Feature | In-Memory | Netlify Blob |
|---------|-----------|--------------|
| **Persistence** | ❌ Lost on restart | ✅ Permanent |
| **Third-party** | ✅ None needed | ✅ Native Netlify |
| **Setup complexity** | ✅ Simple | ✅ Simple |
| **Cost** | ✅ Free | ✅ Free tier |
| **Reliability** | ❌ Temporary | ✅ Reliable |
| **Backup** | ❌ None | ✅ Automatic |

## Data Operations

### Read Operations
- `loadData()` - Loads complete dataset from blob
- `getEvents()` - Returns all non-deleted events
- `getEventById(id)` - Returns specific event

### Write Operations  
- `saveData(data)` - Saves complete dataset to blob
- `createEvent(eventData)` - Creates new event
- `updateEvent(id, updates)` - Updates existing event
- `deleteEvent(id)` - Soft deletes event (sets deletedAt)

### Authentication
- `authenticateUser(username, password)` - Validates user credentials

## Default Data
The system initializes with:
- **1 Sample Event** - "Monthly Tournament" (in-progress)
- **2 Users**:
  - Admin: `admin` / `golfsociety2024`
  - Viewer: `viewer` / `viewonly2024`

## Netlify Setup
The deployment automatically configures blob storage. No manual setup required!

## Security
- Data is stored securely in Netlify's infrastructure
- Access controlled through Netlify Functions
- Role-based permissions enforced server-side

## Monitoring
Check blob storage usage in your Netlify dashboard under:
**Site Settings** → **Functions** → **Blob Storage**

## Future Enhancements
This blob implementation can easily be extended for:
- User management
- Data export/import
- Audit logging
- Multi-tenancy support
