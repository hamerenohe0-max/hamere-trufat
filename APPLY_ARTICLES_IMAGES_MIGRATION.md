# Fix: Articles Images Column Missing

## Error
```
Could not find the 'images' column of 'articles' in the schema cache
```

## Problem
The `articles` table is missing the `images` column. The migration file exists but hasn't been applied to your Supabase database.

## Solution: Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `obcvkqtgdhohkrjdhdmk`
3. **Navigate to**: SQL Editor (left sidebar)
4. **Click**: "New query"
5. **Copy and paste** this SQL:

```sql
-- Add images column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing cover_image to images array for backward compatibility
UPDATE articles 
SET images = ARRAY[cover_image] 
WHERE cover_image IS NOT NULL 
  AND cover_image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);
```

6. **Click**: "Run" (or press Ctrl+Enter)
7. **Verify**: You should see "Success. No rows returned"

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd backend
supabase db push
```

### Option 3: Direct SQL Connection

If you have direct database access:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.obcvkqtgdhohkrjdhdmk.supabase.co:5432/postgres" -f supabase/migrations/003_add_articles_images.sql
```

## Verify Migration

After applying the migration, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'images';
```

You should see:
```
column_name | data_type
------------+-----------
images      | ARRAY
```

## After Migration

1. **Restart the backend server** (if running)
2. **Try updating an article again** - the error should be resolved

## Alternative: Quick Fix (Temporary)

If you can't run the migration right now, the code has been updated to handle missing `images` column gracefully. However, you should still apply the migration for full functionality.

## Files Modified

- `backend/src/modules/articles/services/articles.service.ts` - Added error handling for missing column
- `backend/apply-migrations.sql` - SQL script to apply migration
- `APPLY_ARTICLES_IMAGES_MIGRATION.md` - This guide

