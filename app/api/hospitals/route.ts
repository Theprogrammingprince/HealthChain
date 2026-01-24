import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Use service role if available to bypass RLS
        const client = createClient(
            supabaseUrl,
            serviceRoleKey || anonKey,
            { auth: { persistSession: false } }
        );

        const { data, error } = await client
            .from('hospital_profiles')
            .select('id, hospital_name')
            .eq('verification_status', 'verified') // Only show verified hospitals
            .order('hospital_name', { ascending: true });

        if (error) {
            console.error('Error fetching hospitals:', error);
            return NextResponse.json(
                { error: 'Failed to fetch hospitals', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data || []
        });

    } catch (error: unknown) {
        console.error('Error in hospitals API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
