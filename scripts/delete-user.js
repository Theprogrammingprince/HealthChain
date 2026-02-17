const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deleteUser() {
    const email = 'weblegend16@gmail.com';
    console.log(`Deleting user: ${email}`);

    try {
        // 1. Get the user from Auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users.find(u => u.email === email);
        if (!user) {
            console.log('User not found in Auth.');
        } else {
            // 2. Delete from Auth (will cascade to public.users if PK is shared)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error('Error deleting from Auth:', deleteError);
            } else {
                console.log(`Successfully deleted user ${user.id} from Auth.`);
            }
        }

        // 3. Just in case, try to delete from public.users separately
        const { error: profileError } = await supabase
            .from('users')
            .delete()
            .eq('email', email);

        if (profileError) {
            console.error('Error deleting from Profiles:', profileError);
        } else {
            console.log('Successfully cleaned up any remaining profile records.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

deleteUser();
