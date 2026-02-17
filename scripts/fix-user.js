const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixUser() {
    const orphanedId = 'a76a9b5d-8986-4c36-aa2a-d6ed9569a2d7';
    const correctAuthId = '5bad4123-fb51-4902-96db-496a6785ad86';
    const email = 'weblegend16@gmail.com';

    console.log(`Fixing user ${email}: Moving profile from ${orphanedId} to ${correctAuthId}`);

    try {
        // 1. Get the existing profile
        const { data: profile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', orphanedId)
            .single();

        if (fetchError || !profile) {
            console.error('Could not find orphaned profile:', fetchError);
            return;
        }

        console.log('Found orphaned profile. Creating new one with correct ID...');

        // 2. Create new record with correct ID
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                ...profile,
                id: correctAuthId,
                created_at: new Date().toISOString() // Brand new
            }]);

        if (insertError) {
            console.error('Error inserting corrected profile:', insertError);
            // If it already exists, maybe just update it
            if (insertError.code === '23505') {
                console.log('Profile with correct ID already exists. Updating...');
                await supabase.from('users').update({ email }).eq('id', correctAuthId);
            } else {
                return;
            }
        }

        // 3. Delete the orphaned record
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', orphanedId);

        if (deleteError) {
            console.error('Error deleting orphaned profile:', deleteError);
        } else {
            console.log('Successfully moved profile to correct ID!');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fixUser();
