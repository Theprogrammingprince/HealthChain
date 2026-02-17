
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectUser(email) {
    console.log(`Inspecting Auth status for: ${email}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.log('User not found in Auth.');
        return;
    }

    console.log('--- Auth User Record ---');
    console.log({
        id: user.id,
        email: user.email,
        confirmed_at: user.confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        identities: user.identities?.map(i => ({ provider: i.provider, identity_id: i.identity_id })),
        created_at: user.created_at,
        updated_at: user.updated_at
    });
}

const email = 'weblegend16@gmail.com';
inspectUser(email);
