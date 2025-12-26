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

const publishers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Sol Hn',
    email: 'sol.hn@hamerenoh.org',
    password: 'password123',
    bio: 'Spiritual writer and teacher',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Luca',
    email: 'luca@hamerenoh.org',
    password: 'password123',
    bio: 'Orthodox Christian author',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Eyu Ze Ethiopia',
    email: 'eyu.ze@hamerenoh.org',
    password: 'password123',
    bio: 'Ethiopian Orthodox spiritual guide',
  },
];

async function addPublishers() {
  console.log('Adding publishers to database...\n');

  for (const publisher of publishers) {
    console.log(`Processing: ${publisher.name} (${publisher.email})`);

    // Hash password using the same method as the backend
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(publisher.password, salt);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', publisher.email.toLowerCase())
      .single();

    if (existingUser) {
      console.log(`  → User exists, updating...`);
      const { error } = await supabase
        .from('users')
        .update({
          name: publisher.name,
          password_hash: passwordHash,
          role: 'publisher',
          status: 'active',
          profile: {
            bio: publisher.bio,
            avatarUrl: 'https://via.placeholder.com/150',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);

      if (error) {
        console.error(`  ❌ Error updating: ${error.message}`);
      } else {
        console.log(`  ✅ Updated successfully`);
      }
    } else {
      console.log(`  → Creating new user...`);
      const { error } = await supabase.from('users').insert({
        id: publisher.id,
        name: publisher.name,
        email: publisher.email.toLowerCase(),
        password_hash: passwordHash,
        role: 'publisher',
        status: 'active',
        profile: {
          bio: publisher.bio,
          avatarUrl: 'https://via.placeholder.com/150',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`  ❌ Error creating: ${error.message}`);
      } else {
        console.log(`  ✅ Created successfully`);
      }
    }
  }

  console.log('\n✅ Publisher setup complete!\n');

  // Verify publishers
  console.log('Verifying publishers...');
  const { data: publisherUsers, error: verifyError } = await supabase
    .from('users')
    .select('id, name, email, role, status')
    .eq('role', 'publisher')
    .order('created_at');

  if (verifyError) {
    console.error('Error verifying:', verifyError.message);
  } else {
    console.log(`\nFound ${publisherUsers?.length || 0} publishers:`);
    publisherUsers?.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ${user.status}`);
    });
  }

  console.log('\n📝 Login Credentials:');
  console.log('  Email: luca@hamerenoh.org');
  console.log('  Password: password123');
}

addPublishers().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

