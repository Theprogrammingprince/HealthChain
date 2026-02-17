
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function confirmUserForce(email) {
    console.log(`Force confirming user: ${email}`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return console.error('List error:', listError);

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return console.log('User not found.');

    console.log(`User ID: ${user.id}. Current confirmed_at: ${user.confirmed_at}`);

    // Try to confirm by setting the confirmed_at date directly
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: { ...user.user_metadata, email_verified: true }
    });

    if (error) {
        console.error('Update error:', error);
    } else {
        // Check if it worked
        const { data: { user: verifiedUser } } = await supabase.auth.admin.getUserById(user.id);
        console.log('Post-update check:', {
            id: verifiedUser.id,
            email: verifiedUser.email,
            confirmed_at: verifiedUser.confirmed_at,
            email_confirmed_at: verifiedUser.email_confirmed_at
        });
    }
}

const email = 'weblegend16@gmail.com';
confirmUserForce(email);
