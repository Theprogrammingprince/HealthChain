const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkUser() {
    const email = 'weblegend16@gmail.com';
    console.log(`Checking for user with email: ${email}`);

    try {
        // Check public.users table
        const { data: profiles, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        } else {
            console.log('Profile found:', profiles);
        }

        // Check auth.users (requires service role)
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError);
        } else {
            const authUser = users.find(u => u.email === email);
            if (authUser) {
                console.log('Auth user found:', {
                    id: authUser.id,
                    email: authUser.email,
                    confirmed_at: authUser.confirmed_at,
                    last_sign_in_at: authUser.last_sign_in_at
                });
            } else {
                console.log('User not found in auth.users');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkUser();
