# Applying Database Schema to Supabase

## Schema Management Overview

Unlike MongoDB (which creates collections lazily), Supabase uses PostgreSQL with a defined schema. The schema is managed through **SQL migration files**.

## Migration Files Location

All migration files are stored in:

```
backend/src/database/migrations/
```

Each migration file is timestamped and applied in order:
- `001_initial_schema.sql` — Core tables (users, roles, etc.)
- `002_content_tables.sql` — News, articles, events, feasts
- `003_media_storage.sql` — Media and file storage tables
- `004_user_interactions.sql` — Comments, reactions, bookmarks
- ... additional migrations as needed

## How to Apply Migrations

### Method 1: Using npm script (Recommended)

```powershell
cd backend
npm run migrate
```

This applies all pending migrations in order.

### Method 2: Manual SQL Execution

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy the contents of the migration file
3. Paste into the SQL Editor
4. Click **"Run"** to execute
5. Repeat for each migration file in order

### Method 3: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## What the Schema Creates

The migrations create the following tables with full Row Level Security (RLS):

### Core Tables
| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `users` | User accounts (admins, publishers) | Yes |
| `profiles` | User profile data | Yes |

### Content Tables
| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `news` | News articles | Yes |
| `articles` | Informational articles | Yes |
| `events` | Church events | Yes |
| `feasts` | Religious feasts/holidays | Yes |
| `dailyreadings` | Daily scripture readings | Yes |

### Media Tables
| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `media` | Uploaded media metadata | Yes |
| `media_folders` | Media folder organization | Yes |

### Interaction Tables
| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `newscomments` | Comments on news | Yes |
| `newsreactions` | Likes/dislikes on news | Yes |
| `newsbookmarks` | Bookmarked news | Yes |
| `articlebookmarks` | Bookmarked articles | Yes |

### Other Tables
| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `notifications` | Push notifications | Yes |
| `gamescores` | Game scores | Yes |
| `progressreports` | User progress reports | Yes |
| `publisherrequests` | Publisher applications | Yes |
| `offlinecaches` | Offline content cache | Yes |

## RLS Policies

Each table includes Row Level Security policies that control access:

- **Public read**: Anyone can read published content
- **Authenticated write**: Only logged-in users can create content
- **Admin only**: Certain operations restricted to admin role
- **Owner access**: Users can only modify their own data

## Verifying Schema Application

### Method A: Check Backend Logs

Look for successful migration message:
```
[Migrations] All migrations applied successfully
```

### Method B: Supabase Table Editor

1. Go to **Supabase Dashboard → Table Editor**
2. You should see all the tables listed above
3. Click a table to see its columns and indexes

### Method C: Test with API

```powershell
# Create a test news item
curl -X POST http://localhost:4000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","role":"admin"}'
```

If the migration ran correctly, data will be stored in the PostgreSQL tables.

## Rolling Back Migrations

If a migration causes issues:

1. **Option A**: Create a new migration that reverses the changes
2. **Option B**: Use Supabase Dashboard → Table Editor to manually drop/recreate tables
3. **Option C**: Restore from a Supabase backup (available in project settings)

## Troubleshooting

### Migrations Fail to Run

**Issue:** `npm run migrate` throws errors

**Solutions:**
- Ensure Supabase credentials are correct in `.env`
- Check that the Supabase project is active
- Verify the SQL syntax is valid PostgreSQL
- Run migrations one at a time via SQL Editor to isolate errors

### Tables Missing After Migration

**Issue:** Expected tables don't appear

**Solutions:**
- Check migration output for errors
- Verify the migration file exists in `backend/src/database/migrations/`
- Run `npm run migrate` again (it skips already-applied migrations)

### RLS Policy Errors

**Issue:** API returns 403 or empty results

**Solutions:**
- Go to Supabase Dashboard → Authentication → Policies
- Verify RLS policies exist for each table
- For testing, temporarily disable RLS on a table
- Check that the API is using the correct role (anon vs service_role)

## Summary

- ✅ Schema is managed via SQL migration files
- ✅ Run `npm run migrate` to apply all pending migrations
- ✅ Tables include full RLS policies for security
- ✅ Verify via Supabase Dashboard or API testing
