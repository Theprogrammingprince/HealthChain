import { createClient } from '@/lib/supabase/server';
import { sendReplyEmail } from '@/lib/email-service';
import { NextResponse } from 'next/server';

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

        const supabase = await createClient();

        // Verify admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch original message
        const { data: message, error: fetchError } = await supabase
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // Send email reply
        try {
            await sendReplyEmail(message.email, message.message, reply);
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        // Update message status and store reply
        const { error: updateError } = await supabase
            .from('contact_messages')
            .update({
                status: 'replied',
                admin_reply: reply,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Failed to update message status:', updateError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin reply POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
