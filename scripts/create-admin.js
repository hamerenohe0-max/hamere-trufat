const path = require('path');
const fs = require('fs');

const backendDir = path.resolve(__dirname, '../backend');
// Resolve modules from backend's node_modules
const modulePath = path.join(backendDir, 'node_modules');
const { createClient } = require(path.join(modulePath, '@supabase/supabase-js'));
const bcrypt = require(path.join(modulePath, 'bcryptjs'));

// Load .env from backend
const envPath = path.join(backendDir, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const [,, email, password, name] = process.argv;

if (!email || !password) {
  console.log('Usage: node scripts/create-admin.js <email> <password> [name]');
  console.log('Example: node scripts/create-admin.js admin@example.com MyPassword123 "Admin User"');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const displayName = name || email.split('@')[0];
  const hash = await bcrypt.hash(password, 10);

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log('User exists, updating to admin...');
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash, role: 'admin', status: 'active' })
      .eq('id', existing.id);
    if (error) { console.error('Update failed:', error.message); process.exit(1); }
    console.log('Updated. Email:', email, '/ Password:', password);
  } else {
    console.log('Creating admin user...');
    const { error } = await supabase
      .from('users')
      .insert({ name: displayName, email, password_hash: hash, role: 'admin', status: 'active', profile: { bio: 'Administrator' } });
    if (error) { console.error('Create failed:', error.message); process.exit(1); }
    console.log('Created. Email:', email, '/ Password:', password);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
