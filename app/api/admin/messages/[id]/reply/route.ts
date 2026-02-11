import { createClient } from '@supabase/supabase-js';
import { sendReplyEmail } from '@/lib/email-service';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { reply } = await request.json();

        if (!reply) {
            return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
        }

        const { data: message, error: fetchError } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        try {
            await sendReplyEmail(message.email, message.message, reply);
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
        }

        const { error: updateError } = await supabaseAdmin
            .from('contact_messages')
            .update({
                status: 'replied',
                admin_reply: reply,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Failed to update message status:', updateError);
            return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin reply POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
