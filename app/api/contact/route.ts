import { createClient } from '@supabase/supabase-js';
import { sendContactNotification } from '@/lib/email-service';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { first_name, last_name, email, message } = body;

        if (!first_name || !last_name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = supabaseAdmin;

        // 1. Save to database
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert([
                { first_name, last_name, email, message, status: 'unread' }
            ]);

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save message' },
                { status: 500 }
            );
        }

        // 2. Send notification email to admin
        try {
            await sendContactNotification({ first_name, last_name, email, message });
        } catch (emailError) {
            // Don't fail the whole request if email fails, but log it
            console.error('Email notification failed:', emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Inquiry submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
