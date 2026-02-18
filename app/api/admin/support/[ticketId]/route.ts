import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all messages for a support ticket
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        const { ticketId } = await params;

        const { data: messages, error } = await supabaseAdmin
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Failed to fetch ticket messages:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error('Support ticket messages GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Admin sends a reply to a support ticket
export async function POST(
    request: Request,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        const { ticketId } = await params;
        const { reply, status } = await request.json();

        if (!reply?.trim()) {
            return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
        }

        // Verify the ticket exists
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Insert the admin reply message
        const { error: msgError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender: 'admin',
                message: reply.trim(),
            });

        if (msgError) {
            console.error('Failed to insert admin reply:', msgError);
            return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
        }

        // Update ticket status if provided
        if (status && ['open', 'in_progress', 'resolved'].includes(status)) {
            const { error: statusError } = await supabaseAdmin
                .from('support_tickets')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ticketId);

            if (statusError) {
                console.error('Failed to update ticket status:', statusError);
            }
        } else {
            // Default: mark as in_progress if currently open
            if (ticket.status === 'open') {
                await supabaseAdmin
                    .from('support_tickets')
                    .update({
                        status: 'in_progress',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', ticketId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Support ticket reply POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
