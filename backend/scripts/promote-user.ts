import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: npx ts-node scripts/promote-user.ts <email>');
        process.exit(1);
    }

    // Load environment variables manually
    const envPath = path.resolve(__dirname, '../.env');
    console.log('Loading .env from:', envPath);

    if (!fs.existsSync(envPath)) {
        console.error('.env file not found at:', envPath);
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = envContent
        .split('\n')
        .reduce((acc, line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return acc;

            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);

    console.log('Found keys:', Object.keys(envConfig).join(', '));

    const supabaseUrl = envConfig['SUPABASE_URL'];
    const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
        process.exit(1);
    }

    console.log(`Connecting to Supabase...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Looking up user: ${email}`);

    // 1. Find the user
    // Use ilike for case-insensitive match and don't use single() immediately to debug duplicates
    const { data: users, error: findError } = await supabase
        .from('users')
        .select('id, name, role')
        .ilike('email', email.trim());

    if (findError) {
        console.error('Error finding user:', findError.message);
        process.exit(1);
    }

    if (!users || users.length === 0) {
        console.error(`No user found with email: ${email}`);
        process.exit(1);
    }

    if (users.length > 1) {
        console.warn(`Warning: Found ${users.length} users with this email. Promoting the first one.`);
    }

    const user = users[0];

    console.log(`Found user: ${user.name} (Current Role: ${user.role})`);

    if (user.role === 'admin') {
        console.log('User is already an admin.');
        process.exit(0);
    }

    // 2. Update role
    console.log('Promoting to admin...');
    const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Failed to update user role:', updateError.message);
        process.exit(1);
    }

    console.log('Success! User promoted to admin.');
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
