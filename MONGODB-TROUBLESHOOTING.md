# MongoDB Connection Troubleshooting Guide

## Current Issue: Connection Timeout

The error `queryTxt ETIMEOUT` means your computer cannot reach MongoDB Atlas.

## Step-by-Step Troubleshooting

### 1. Check MongoDB Atlas Cluster Status

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Log in to your account
3. Check if your cluster is **running** (not paused)
   - Paused clusters show a "Resume" button
   - If paused, click "Resume" and wait 1-2 minutes

### 2. Fix Network Access (IP Whitelist)

**This is the most common issue!**

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development, add: `0.0.0.0/0` (allows all IPs)
   - ⚠️ **Warning**: Only use this for development, not production!
4. Or add your specific IP address:
   - Find your IP: Visit https://whatismyipaddress.com
   - Add that IP with `/32` suffix (e.g., `123.45.67.89/32`)

### 3. Fix Connection String - Add Database Name

Your current connection string is missing the database name. It should be:

```
mongodb+srv://hamerenohe0_db_user:hamere_nohe01@cluster0.sfkpanr.mongodb.net/hamere-trufat?appName=Cluster0
```

Notice `/hamere-trufat` before the `?` - this is the database name.

### 4. Verify Database User

1. Go to **Database Access** in MongoDB Atlas
2. Check if user `hamerenohe0_db_user` exists
3. Verify the password is correct: `hamere_nohe01`
4. Ensure the user has **read/write** permissions

### 5. Test Internet Connection

```powershell
# Test if you can reach MongoDB
ping cluster0.sfkpanr.mongodb.net
```

### 6. Check Firewall/Antivirus

- Temporarily disable firewall/antivirus to test
- Some corporate networks block MongoDB connections

### 7. Test Connection with Updated String

After fixing the above, test again:
```powershell
cd backend
node ..\scripts\test-mongodb.js
```

## Quick Fix: Update Connection String

Update `backend/.env`:

```env
MONGODB_URI=mongodb+srv://hamerenohe0_db_user:hamere_nohe01@cluster0.sfkpanr.mongodb.net/hamere-trufat?appName=Cluster0
```

**Key changes:**
- Added `/hamere-trufat` (database name) before the `?`

## Still Not Working?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com
2. **Try a different connection method**: Use the "Connect" button in Atlas to get a fresh connection string
3. **Check MongoDB Atlas logs**: Look for connection attempts in the Atlas dashboard

