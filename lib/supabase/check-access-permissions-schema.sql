-- Check the actual schema of access_permissions table
-- Run this to see what columns exist

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'access_permissions'
ORDER BY ordinal_position;
