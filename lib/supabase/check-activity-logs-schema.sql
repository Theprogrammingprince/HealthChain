-- Check the actual schema of activity_logs table
-- Run this to see what columns exist

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;
