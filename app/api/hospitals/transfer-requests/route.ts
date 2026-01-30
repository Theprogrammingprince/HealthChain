import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const adminClient = createClient(
    supabaseUrl,
    serviceRoleKey || anonKey,
    { auth: { persistSession: false } }
);

// GET - Fetch transfer requests for a hospital
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hospitalId = searchParams.get('hospitalId');

        if (!hospitalId) {
            return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
        }

        const { data, error } = await adminClient
            .from('hospital_transfer_requests')
            .select(`
                *,
                doctor:doctor_profiles!doctor_id(id, first_name, last_name, specialty, medical_license_number, email),
                from_hospital:hospital_profiles!from_hospital_id(id, hospital_name)
            `)
            .eq('to_hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });

    } catch (error: any) {
        console.error('Error fetching arrivals:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Approve or Reject a transfer request
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, action, status, rejectionReason, reviewerId } = body;

        if (!requestId || !action) {
            return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
        }

        if (action === 'review') {
            if (status === 'approved') {
                // Call the Postgres function we created
                const { error } = await adminClient.rpc('approve_hospital_transfer', {
                    request_id: requestId,
                    approver_id: reviewerId || null
                });

                if (error) throw error;

                return NextResponse.json({ success: true, message: 'Transfer approved successfully' });
            } else if (status === 'rejected') {
                const { error } = await adminClient
                    .from('hospital_transfer_requests')
                    .update({
                        status: 'rejected',
                        rejection_reason: rejectionReason,
                        reviewed_at: new Date().toISOString(),
                        reviewed_by: reviewerId || null
                    })
                    .eq('id', requestId);

                if (error) throw error;

                return NextResponse.json({ success: true, message: 'Transfer rejected' });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Error reviewing transfer:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
