-- Add Publishers from Mock Data
-- This script adds the 3 publishers from the mock data to the database

-- Password hash for all mock publishers: "password123"
-- bcrypt hash: $2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK

-- Publisher 1: Sol Hn
INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  role,
  status,
  profile,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sol Hn',
  'sol.hn@hamerenoh.org',
  '$2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK',
  'publisher',
  'active',
  '{"bio": "Spiritual writer and teacher", "avatarUrl": "https://via.placeholder.com/150"}'::JSONB,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- Publisher 2: Luca
INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  role,
  status,
  profile,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Luca',
  'luca@hamerenoh.org',
  '$2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK',
  'publisher',
  'active',
  '{"bio": "Orthodox Christian author", "avatarUrl": "https://via.placeholder.com/150"}'::JSONB,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- Publisher 3: Eyu Ze Ethiopia
INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  role,
  status,
  profile,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Eyu Ze Ethiopia',
  'eyu.ze@hamerenoh.org',
  '$2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK',
  'publisher',
  'active',
  '{"bio": "Ethiopian Orthodox spiritual guide", "avatarUrl": "https://via.placeholder.com/150"}'::JSONB,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- Verify publishers were added
SELECT id, name, email, role, status, created_at 
FROM users 
WHERE role = 'publisher'
ORDER BY created_at;

