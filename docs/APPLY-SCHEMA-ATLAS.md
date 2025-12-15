# 🗄️ Applying Database Schema to MongoDB Atlas

## Automatic Schema Application

**Good news:** The database schema is **automatically applied** when your backend connects to MongoDB Atlas. You don't need to manually create collections or indexes!

## How It Works

### 1. Automatic Collection Creation

MongoDB creates collections automatically when you first insert data. When your NestJS backend:
- Connects to MongoDB Atlas
- Uses Mongoose models to save data
- Collections are created automatically

### 2. Automatic Index Creation

Mongoose automatically creates all indexes defined in your schemas when:
- The backend connects to MongoDB
- Models are registered
- Indexes are created in the background

### 3. Schema Registration

All schemas are registered in `backend/src/app.module.ts`:

```typescript
MongooseModule.forRoot(
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/hamere-trufat',
)
```

When modules are imported, their schemas are automatically registered.

## Steps to Apply Schema

### Step 1: Ensure MongoDB Atlas Connection

1. **Configure Network Access:**
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access"
   - Add your IP address (or `0.0.0.0/0` for development)

2. **Verify Connection String:**
   - Check `backend/.env` has correct `MONGODB_URI`
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/hamere-trufat?retryWrites=true&w=majority`

### Step 2: Start the Backend

```powershell
cd backend
npm run start:dev
```

The backend will:
- Connect to MongoDB Atlas
- Register all Mongoose schemas
- Create indexes automatically

### Step 3: Verify Schema Application

#### Option A: Check Backend Logs

Look for successful connection message:
```
Application is running on: http://localhost:4000
```

If you see MongoDB connection errors, the schema won't be applied.

#### Option B: Use MongoDB Atlas UI

1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. Collections will appear as you use the app:
   - `users` - when first user registers
   - `news` - when first news is created
   - `articles` - when first article is created
   - etc.

#### Option C: Test with API Call

Create a test user to trigger schema creation:

```powershell
# Register a user (creates 'users' collection)
curl -X POST http://localhost:4000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","role":"admin"}'
```

This will create the `users` collection and all its indexes.

## Manual Verification (Optional)

### Check Collections in Atlas

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Select database: `hamere-trufat`
4. You should see collections as they're created

### Check Indexes

1. In MongoDB Atlas, click on a collection
2. Go to "Indexes" tab
3. You should see all indexes defined in the schema

For example, `users` collection should have:
- `_id_` (automatic)
- `email_1` (unique index)
- `email_1` (regular index)

## Schema Application Timeline

Collections are created **lazily** (on first use):

| Collection | Created When |
|------------|--------------|
| `users` | First user registration |
| `news` | First news article created |
| `articles` | First article created |
| `events` | First event created |
| `feasts` | First feast created |
| `media` | First file uploaded |
| `notifications` | First notification sent |
| `gamescores` | First game score saved |
| `dailyreadings` | First reading added |
| `progressreports` | First report created |
| `newscomments` | First comment posted |
| `newsreactions` | First like/dislike |
| `newsbookmarks` | First bookmark |
| `articlebookmarks` | First article bookmark |
| `publisherrequests` | First publisher request |
| `offlinecaches` | First offline sync |

## Force Index Creation (Optional)

If you want to ensure all indexes are created immediately, you can create a simple script:

```javascript
// scripts/create-indexes.js
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import all models to register schemas
    require('../backend/src/modules/users/schemas/user.schema');
    require('../backend/src/modules/news/schemas/news.schema');
    // ... import all schemas
    
    // Force index creation
    await mongoose.connection.syncIndexes();
    console.log('✅ All indexes created');
    
    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createIndexes();
```

However, **this is not necessary** - indexes are created automatically when schemas are used.

## Troubleshooting

### Collections Not Appearing

**Issue:** Collections don't show in Atlas UI

**Solution:**
- Collections are created lazily (on first data insert)
- Use the API to create some data
- Collections will appear automatically

### Indexes Not Created

**Issue:** Indexes missing in Atlas

**Solution:**
- Restart the backend
- Mongoose will recreate missing indexes
- Or wait - indexes are created asynchronously

### Connection Errors

**Issue:** Backend can't connect to Atlas

**Solution:**
- Check Network Access (IP whitelist)
- Verify connection string in `.env`
- Ensure cluster is running (not paused)
- Check username/password are correct

## Summary

✅ **No manual schema application needed!**

The schema is automatically applied when:
1. Backend connects to MongoDB Atlas ✅
2. You use the API to create data ✅
3. Collections and indexes are created automatically ✅

Just ensure:
- MongoDB Atlas Network Access is configured
- Connection string is correct in `backend/.env`
- Backend can connect successfully

That's it! The schema will be applied automatically as you use the application.

