require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testUpdate() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) { console.error('Missing env'); return; }
    const supabase = createClient(url, key);

    // 1. Find a publisher
    const { data: publishers } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'publisher')
        .limit(1);

    if (!publishers || publishers.length === 0) {
        console.log('No publishers found to test.');
        return;
    }

    const userId = publishers[0].id;
    console.log('Testing update on publisher:', userId);

    // 2. Mock the `UsersService.updateProfile` logic for publishers
    const testAvatarUrl = `https://example.com/avatar-${Date.now()}.jpg`;
    const publisherUpdates = {
        bio: "Updated bio via script " + new Date().toISOString(),
        avatar_url: testAvatarUrl
    };

    console.log('Attempting upsert with:', publisherUpdates);

    // Execute WITHOUT .eq() to see if that's the fix
    const { error } = await supabase
        .from('publishers')
        .upsert({ id: userId, ...publisherUpdates });

    if (error) {
        console.error('Upsert failed:', error);
    } else {
        console.log('Upsert successful.');
    }

    // 3. Verify
    const { data: verif } = await supabase
        .from('publishers')
        .select('*')
        .eq('id', userId)
        .single();

    console.log('Verification result:', verif);
    if (verif && verif.avatar_url === testAvatarUrl) {
        console.log('SUCCESS: Avatar URL was updated.');
    } else {
        console.log('FAILURE: Avatar URL mismatch.');
    }
}

testUpdate();
