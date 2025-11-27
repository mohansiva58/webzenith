-- Script to create test users in Supabase
-- Run this AFTER you've created the auth users in Supabase Dashboard

-- Verify users exist in auth.users
SELECT id, email FROM auth.users WHERE email IN ('admin@example.com', 'manager@example.com', 'viewer@example.com');

-- Check if users are in public.users (should be auto-created by trigger)
SELECT id, email, name, role_id FROM public.users WHERE email IN ('admin@example.com', 'manager@example.com', 'viewer@example.com');

-- Assign roles to users
UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'admin') 
WHERE email = 'admin@example.com';

UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'manager') 
WHERE email = 'manager@example.com';

UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'viewer') 
WHERE email = 'viewer@example.com';

-- Verify role assignments
SELECT 
    u.email, 
    u.name,
    r.name as role_name,
    r.slug as role_slug
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email IN ('admin@example.com', 'manager@example.com', 'viewer@example.com');
