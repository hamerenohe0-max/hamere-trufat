require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugFullUpdate() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) { console.error('Missing env'); return; }
    const supabase = createClient(url, key);

    // 1. Find a publisher to test on
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'publisher')
        .limit(1);

    if (!users || users.length === 0) {
        console.error('No publisher found');
        return;
    }
    const user = users[0];
    console.log('Testing with user:', user.id, user.name);

    // Simulate AdminController.updateUser logic
    const payload = {
        status: 'active', // or 'suspended'
        name: user.name + ' (Updated)',
        bio: 'Updated bio ' + Date.now(),
        avatarUrl: 'https://via.placeholder.com/150',
        phone: '+1234567890'
    };

    console.log('Payload:', payload);

    // Step A: Update Status (from AdminController)
    if (payload.status) {
        console.log('Executing Step A: updateStatus...');
        const { data: statusData, error: statusError } = await supabase
            .from('users')
            .update({ status: payload.status })
            .eq('id', user.id)
            .select()
            .single();

        if (statusError) {
            console.error('Step A Failed (updateStatus):', statusError);
            return;
        }
        console.log('Step A Success:', statusData.status);
    }

    // Step B: Update Profile (UsersService.updateProfile)
    console.log('Executing Step B: updateProfile...');

    // B1. Update name 
    if (payload.name) {
        console.log('B1: Updating name...');
        const { error: nameError } = await supabase
            .from('users')
            .update({ name: payload.name })
            .eq('id', user.id);

        if (nameError) {
            console.error('B1 Failed (name update):', nameError);
            return;
        }
    }

    // B2. Update Publisher Profile
    if (user.role === 'publisher') {
        console.log('B2: Upserting publisher profile...');
        const publisherUpdates = {
            bio: payload.bio,
            phone: payload.phone,
            avatar_url: payload.avatarUrl // Note: Script mimics the service mapping to snake_case
        };

        // Exact logic from service (minus .eq if removed)
        const { error: pubError } = await supabase
            .from('publishers')
            .upsert({ id: user.id, ...publisherUpdates });

        if (pubError) {
            console.error('B2 Failed (publisher upsert):', pubError);
            return;
        }
        console.log('B2 Success.');
    }

    console.log('FULL UPDATE SUCCESSFUL.');
}

debugFullUpdate();
