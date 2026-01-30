import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create admin client for bypassing RLS when needed
const adminClient = createClient(
    supabaseUrl,
    serviceRoleKey || anonKey,
    { auth: { persistSession: false } }
);

// GET - Fetch transfer requests for a doctor
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('doctorId');

        if (!doctorId) {
            return NextResponse.json(
                { error: 'Doctor ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await adminClient
            .from('hospital_transfer_requests')
            .select(`
                *,
                to_hospital:hospital_profiles!to_hospital_id(id, hospital_name),
                from_hospital:hospital_profiles!from_hospital_id(id, hospital_name)
            `)
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || []
        });

    } catch (error: any) {
        console.error('Error fetching transfer requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transfer requests', details: error.message },
            { status: 500 }
        );
    }
}

// POST - Create a new transfer request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { doctorId, fromHospitalId, toHospitalId, reason } = body;

        if (!doctorId || !toHospitalId) {
            return NextResponse.json(
                { error: 'Doctor ID and target hospital ID are required' },
                { status: 400 }
            );
        }

        // Check if doctor already has a pending request
        const { data: existingRequest } = await adminClient
            .from('hospital_transfer_requests')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            return NextResponse.json(
                { error: 'You already have a pending transfer request. Please wait for it to be reviewed or cancel it first.' },
                { status: 409 }
            );
        }

        // Check that target hospital is different from current
        if (fromHospitalId === toHospitalId) {
            return NextResponse.json(
                { error: 'Cannot request transfer to the same hospital' },
                { status: 400 }
            );
        }

        // Create the transfer request
        const { data, error } = await adminClient
            .from('hospital_transfer_requests')
            .insert({
                doctor_id: doctorId,
                from_hospital_id: fromHospitalId || null,
                to_hospital_id: toHospitalId,
                request_reason: reason || null,
                status: 'pending'
            })
            .select(`
                *,
                to_hospital:hospital_profiles!to_hospital_id(id, hospital_name)
            `)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Transfer request submitted successfully',
            data
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating transfer request:', error);
        return NextResponse.json(
            { error: 'Failed to create transfer request', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH - Cancel a transfer request
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, action } = body;

        if (!requestId || !action) {
            return NextResponse.json(
                { error: 'Request ID and action are required' },
                { status: 400 }
            );
        }

        if (action === 'cancel') {
            const { error } = await adminClient
                .from('hospital_transfer_requests')
                .update({ status: 'cancelled' })
                .eq('id', requestId)
                .eq('status', 'pending');

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: 'Transfer request cancelled'
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Error updating transfer request:', error);
        return NextResponse.json(
            { error: 'Failed to update transfer request', details: error.message },
            { status: 500 }
        );
    }
}
