require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debug() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(url, key);

    console.log('Testing connection to users table...');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role')
        .limit(5);

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }
    console.log('Users found:', users?.length);

    console.log('Testing join with publishers...');
    // Force cast to any or just standard JS usage (this is JS/TS)
    const { data: joined, error: joinError } = await supabase
        .from('users')
        .select('id, role, publishers(*)')
        .eq('role', 'publisher')
        .limit(5);

    if (joinError) {
        console.error('Error querying join:', joinError);
        // Print hint about relationship
        console.log('Possible cause: PostgREST relationship not detected.');
    } else {
        console.log('Join successful!');
        console.log(JSON.stringify(joined, null, 2));
    }
}

debug();
