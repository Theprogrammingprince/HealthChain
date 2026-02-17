const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function recreateUser() {
    const authId = '5bad4123-fb51-4902-96db-496a6785ad86';
    const email = 'weblegend16@gmail.com';
    const fullName = 'Prosper Okarter';

    console.log(`Recreating user profile for ${email} with ID ${authId}`);

    try {
        // 1. Recreate public.users
        const { error: userError } = await supabase
            .from('users')
            .insert([{
                id: authId,
                email: email,
                role: 'patient',
                auth_provider: 'email',
                full_name: fullName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (userError) {
            console.error('Error creating user record:', userError);
        } else {
            console.log('Successfully created user record.');
        }

        // 2. Recreate patient_profiles (since it was likely deleted by cascade)
        const { error: profileError } = await supabase
            .from('patient_profiles')
            .insert([{
                user_id: authId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (profileError) {
            console.error('Error creating patient profile:', profileError);
        } else {
            console.log('Successfully created patient profile.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

recreateUser();
