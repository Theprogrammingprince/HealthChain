
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function detailUser(userId) {
    console.log(`Getting details for user ID: ${userId}`);

    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
        console.error('Error getting user:', error);
        return;
    }

    console.log('--- Detailed User Record ---');
    console.log(JSON.stringify(user, null, 2));
}

const userId = '35c91ec4-a9ad-4eff-9d39-83bd415bde81'; // From previous inspect
detailUser(userId);
