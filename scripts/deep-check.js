const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deepCheck() {
    const profileId = 'a76a9b5d-8986-4c36-aa2a-d6ed9569a2d7';
    const authId = '5bad4123-fb51-4902-96db-496a6785ad86';
    const email = 'weblegend16@gmail.com';

    console.log(`Deep check for email: ${email}`);

    try {
        // 1. Search Auth for the profile's ID
        const { data: userByProfileId, error: error1 } = await supabase.auth.admin.getUserById(profileId);
        if (userByProfileId && userByProfileId.user) {
            console.log('User found in Auth by Profile ID:', userByProfileId.user.email);
        } else {
            console.log('No Auth user found for Profile ID:', profileId);
        }

        // 2. Search Profiles for the Auth ID
        const { data: profileByAuthId, error: error2 } = await supabase
            .from('users')
            .select('*')
            .eq('id', authId);

        if (profileByAuthId && profileByAuthId.length > 0) {
            console.log('Profile found for Auth ID:', profileByAuthId);
        } else {
            console.log('No Profile found for Auth ID:', authId);
        }

        // 3. List all users with this email in public.users
        const { data: allProfiles, error: error3 } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);
        console.log(`All profiles for ${email}:`, allProfiles);

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

deepCheck();
