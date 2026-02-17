const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Supabase credentials missing in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkIntegrity() {
    const authId = '5bad4123-fb51-4902-96db-496a6785ad86';
    const email = 'weblegend16@gmail.com';

    console.log(`Checking integrity for ${email} (ID: ${authId})`);

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authId)
            .single();
        console.log('User in public.users:', user);

        const { data: patient, error: patientError } = await supabase
            .from('patient_profiles')
            .select('*')
            .eq('user_id', authId);
        console.log('Patient profiles:', patient);

        const { data: doctor, error: doctorError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('user_id', authId);
        console.log('Doctor profiles:', doctor);

        const { data: hospital, error: hospitalError } = await supabase
            .from('hospital_profiles')
            .select('*')
            .eq('user_id', authId);
        console.log('Hospital profiles:', hospital);

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkIntegrity();
