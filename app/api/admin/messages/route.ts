import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        console.log('\n📬 [ADMIN MESSAGES] Fetching contact messages and support tickets...');

        // 1. Fetch contact form messages
        const { data: contactMessages, error: contactError } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (contactError) {
            console.error('   ❌ Error fetching contact_messages:', contactError.message);
        } else {
            console.log(`   ✅ Contact messages: ${contactMessages?.length || 0} found`);
        }

        // 2. Fetch support tickets from the dashboard
        const { data: supportTickets, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .order('updated_at', { ascending: false });

        if (ticketError) {
            console.error('   ❌ Error fetching support_tickets:', ticketError.message);
            console.error('   → Make sure you have run the support_tables.sql migration in Supabase!');
        } else {
            console.log(`   ✅ Support tickets: ${supportTickets?.length || 0} found`);
        }

        // 3. For each ticket, get latest message preview and unread status
        const ticketsWithPreview = await Promise.all(
            (supportTickets || []).map(async (ticket) => {
                // Get latest message
                const { data: latestMsgs } = await supabaseAdmin
                    .from('support_messages')
                    .select('message, sender, created_at')
                    .eq('ticket_id', ticket.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                // Check for unread user messages (user messages after last admin reply)
                const { data: allMsgs } = await supabaseAdmin
                    .from('support_messages')
                    .select('sender, created_at')
                    .eq('ticket_id', ticket.id)
                    .order('created_at', { ascending: false });

                const lastAdminReply = allMsgs?.find(m => m.sender === 'admin');
                const hasUnreadUserMessages = allMsgs?.some(m =>
                    m.sender === 'user' &&
                    (!lastAdminReply || new Date(m.created_at) > new Date(lastAdminReply.created_at))
                );

                return {
                    ...ticket,
                    latest_message: latestMsgs?.[0]?.message || '',
                    latest_message_sender: latestMsgs?.[0]?.sender || 'user',
                    has_unread: hasUnreadUserMessages || false,
                };
            })
        );

        console.log('   📬 Done fetching all messages.\n');

        return NextResponse.json({
            messages: contactMessages || [],
            support_tickets: ticketsWithPreview,
        });
    } catch (error) {
        console.error('Admin messages GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
