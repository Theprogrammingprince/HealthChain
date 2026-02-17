const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkToday() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for registrations on: ${today}`);

    try {
        // 1. Check Auth.users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            console.error('Error listing auth users:', authError);
        } else {
            const todayUsers = users.filter(u => u.created_at.startsWith(today));
            console.log(`Auth users created today (${todayUsers.length}):`);
            todayUsers.forEach(u => {
                console.log(` - ID: ${u.id}, Email: ${u.email}, Created: ${u.created_at}`);
            });
        }

        // 2. Check public.users
        const { data: profiles, error: profileError } = await supabase
            .from('users')
            .select('*')
            .gte('created_at', `${today}T00:00:00Z`);

        if (profileError) {
            console.error('Error listing profiles:', profileError);
        } else {
            console.log(`Profiles created today (${profiles.length}):`);
            profiles.forEach(p => {
                console.log(` - ID: ${p.id}, Email: ${p.email}, Created: ${p.created_at}, Role: ${p.role}`);
            });
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkToday();
