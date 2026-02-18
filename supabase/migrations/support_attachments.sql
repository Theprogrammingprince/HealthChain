-- Add attachment support to support_messages
-- Run this in your Supabase SQL editor

-- Add attachment columns to support_messages
ALTER TABLE public.support_messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attachment_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT NULL;

-- Create storage bucket for support attachments (run this separately if needed)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('support-attachments', 'support-attachments', true)
-- ON CONFLICT (id) DO NOTHING;
