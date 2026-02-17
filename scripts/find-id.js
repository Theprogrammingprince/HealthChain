const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findId() {
    const profileId = 'a76a9b5d-8986-4c36-aa2a-d6ed9569a2d7';
    console.log(`Searching for Auth ID: ${profileId}`);

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.error('Error listing auth users:', error);
            return;
        }

        const match = users.find(u => u.id === profileId);
        if (match) {
            console.log('FOUND MATCH IN AUTH:', {
                id: match.id,
                email: match.email,
                created_at: match.created_at,
                confirmed_at: match.confirmed_at
            });
        } else {
            console.log('ID NOT FOUND IN AUTH LIST (checked 1000 users)');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

findId();
