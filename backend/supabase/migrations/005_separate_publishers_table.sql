-- Create publishers table
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  phone TEXT,
  region TEXT,
  language TEXT,
  avatar_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for region to help with filtering if needed
CREATE INDEX IF NOT EXISTS idx_publishers_region ON publishers(region);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_publishers_updated_at ON publishers;
CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data Migration: Move existing publisher profiles from users table to publishers table
INSERT INTO publishers (id, bio, phone, region, language, avatar_url, created_at, updated_at)
SELECT 
  id,
  profile->>'bio',
  profile->>'phone',
  profile->>'region',
  profile->>'language',
  profile->>'avatarUrl', -- Note: existing JSON used avatarUrl (camelCase)
  created_at,
  updated_at
FROM users 
WHERE role = 'publisher'
ON CONFLICT (id) DO NOTHING;
