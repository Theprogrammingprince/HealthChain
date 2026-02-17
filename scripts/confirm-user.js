
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function confirmUser(email) {
    console.log(`Manually confirming user: ${email}`);

    // 1. Find the user ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return console.error('List error:', listError);

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return console.log('User not found.');

    console.log(`Found user ID: ${user.id}. Confirming...`);

    // 2. Update the user to mark email as confirmed and verified
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: { ...user.user_metadata, email_verified: true }
    });

    if (error) {
        console.error('Confirmation error:', error);
    } else {
        console.log('Successfully confirmed user!', {
            id: data.user.id,
            email: data.user.email,
            confirmed_at: data.user.confirmed_at
        });
    }
}

const email = 'weblegend16@gmail.com';
confirmUser(email);
