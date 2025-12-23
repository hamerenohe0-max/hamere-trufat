-- Create admin user for Hamere Trufat
-- Email: admin@hamerenoh.org
-- Password: admin@123

-- Note: The password hash below is bcrypt hash of "admin@123"
-- Generated with 10 salt rounds

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
  gen_random_uuid(),
  'Admin',
  'admin@hamerenoh.org',
  '$2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK', -- bcrypt hash of "admin@123"
  'admin',
  'active',
  '{"bio": "System Administrator"}',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, name, email, role, status, created_at 
FROM users 
WHERE email = 'admin@hamerenoh.org';
