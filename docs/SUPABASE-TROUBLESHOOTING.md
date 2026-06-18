# Supabase Connection Troubleshooting Guide

## Current Issue: Connection Timeout or Authentication Error

Errors like `connect ECONNREFUSED`, `401 Unauthorized`, or `Invalid API key` mean your application cannot connect to Supabase.

## Step-by-Step Troubleshooting

### 1. Check Supabase Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Check if your project is **active** (not paused)
   - Paused projects show a "Restore" button
   - If paused, click "Restore" and wait 1-2 minutes
4. Verify the project has not exceeded free tier limits

### 2. Verify Credentials

Your `backend/.env` file should have:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Common mistakes:**
- `SUPABASE_URL` is wrong — it must include `https://` and end with `.supabase.co`
- Using the `anon` key where `service_role` key is needed (and vice versa)
- Keys have extra spaces or quotes around them
- Using keys from a different Supabase project

### 3. Regenerate Keys (if compromised)

1. In Supabase Dashboard, go to **Project Settings → API**
2. Click **"Regenerate"** next to the key that needs renewal
3. Update `backend/.env` with the new key
4. Restart the backend

### 4. Check Row Level Security (RLS) Policies

If you can connect but queries return empty or permission errors:

1. Go to **Supabase Dashboard → Table Editor**
2. Select a table (e.g., `users`, `news`)
3. Go to **Authentication → Policies**
4. Ensure RLS policies exist for each table
5. For development, you can temporarily disable RLS on a table (not recommended for production)

### 5. Test Connection via API

```powershell
# Test Supabase REST API directly
curl -X GET "https://your-project.supabase.co/rest/v1/" `
  -H "apikey: your-anon-key" `
  -H "Authorization: Bearer your-anon-key"
```

If this fails, the issue is with Supabase itself or your network.

### 6. Check Network/Firewall

- Supabase requires outbound HTTPS (port 443)
- Corporate networks or VPNs may block connections
- Try:
  ```powershell
  # Test DNS resolution
  nslookup your-project.supabase.co
  ```
- Temporarily disable firewall/VPN to test
- Try from a different network (e.g., mobile hotspot)

### 7. Verify Database Password

If using direct database connections:

1. Go to **Project Settings → Database**
2. Check the connection string and password
3. Reset the database password if forgotten (Project Settings → Database → Reset password)

### 8. Check Database Migrations

If tables are missing:

```powershell
cd backend
npm run migrate
```

This applies all pending SQL migration files from `backend/src/database/migrations/`.

### 9. Check Supabase Status Page

Visit https://status.supabase.com to check if there's an ongoing outage.

## Quick Fix Checklist

- [ ] Supabase project is active (not paused)
- [ ] `SUPABASE_URL` format is correct (`https://*.supabase.co`)
- [ ] `SUPABASE_ANON_KEY` is correct
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is correct
- [ ] No extra spaces/quotes in `.env` values
- [ ] RLS policies are configured
- [ ] Database migrations have been run
- [ ] Network allows HTTPS outbound connections
- [ ] Supabase is not experiencing an outage

## Still Not Working?

1. **Check backend logs** for specific error messages
2. **Check Supabase Dashboard** → Logs for connection attempts
3. **Try creating a new Supabase project** and updating credentials
4. **Open a GitHub issue** in the repository for support
