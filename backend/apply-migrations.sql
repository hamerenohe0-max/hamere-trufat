-- Apply missing migrations to Supabase database
-- Run this in your Supabase SQL Editor

-- Migration 003: Add images column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing cover_image to images array for backward compatibility
UPDATE articles 
SET images = ARRAY[cover_image] 
WHERE cover_image IS NOT NULL 
  AND cover_image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'images';

