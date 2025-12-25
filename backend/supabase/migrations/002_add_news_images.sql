-- Add images column to news table for multiple images support
-- This migration adds support for up to 4 images per news article

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing cover_image to images array for backward compatibility
UPDATE news 
SET images = ARRAY[cover_image] 
WHERE cover_image IS NOT NULL 
  AND cover_image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

