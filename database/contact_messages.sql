-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Admins can manage messages
CREATE POLICY "Admins can manage messages"
    ON public.contact_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::uuid = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Anyone can submit contact messages
CREATE POLICY "Anyone can submit contact messages"
    ON public.contact_messages
    FOR INSERT
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant access
GRANT ALL ON public.contact_messages TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
