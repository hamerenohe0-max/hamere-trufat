import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@hamerenoh.org';
  const password = 'admin@123';
  const name = 'Admin User';

  console.log(`Creating admin user: ${email}`);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    console.log('User already exists. Updating password and role...');
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        role: 'admin',
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id);

    if (error) {
      console.error('Error updating user:', error.message);
    } else {
      console.log('Admin user updated successfully.');
    }
  } else {
    console.log('Creating new admin user...');
    const { error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: { bio: 'System Administrator' }
      });

    if (error) {
      console.error('Error creating user:', error.message);
    } else {
      console.log('Admin user created successfully.');
    }
  }
}

createAdmin().catch(console.error);
