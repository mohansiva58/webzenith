-- Seed Roles
INSERT INTO public.roles (slug, name, disabled) VALUES
    ('admin', 'Administrator', false),
    ('manager', 'Manager', false),
    ('viewer', 'Viewer', false)
ON CONFLICT (slug) DO NOTHING;

-- Seed Permissions
-- Users entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('users', 'create', 'users.create', 'Create new users'),
    ('users', 'read', 'users.read', 'View users'),
    ('users', 'update', 'users.update', 'Update user details'),
    ('users', 'delete', 'users.delete', 'Delete users')
ON CONFLICT (key) DO NOTHING;

-- Roles entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('roles', 'create', 'roles.create', 'Create new roles'),
    ('roles', 'read', 'roles.read', 'View roles'),
    ('roles', 'update', 'roles.update', 'Update role details'),
    ('roles', 'delete', 'roles.delete', 'Delete roles')
ON CONFLICT (key) DO NOTHING;

-- Permissions entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('permissions', 'create', 'permissions.create', 'Create new permissions'),
    ('permissions', 'read', 'permissions.read', 'View permissions'),
    ('permissions', 'update', 'permissions.update', 'Update permission details'),
    ('permissions', 'delete', 'permissions.delete', 'Delete permissions')
ON CONFLICT (key) DO NOTHING;

-- Leads entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('leads', 'create', 'leads.create', 'Create new leads'),
    ('leads', 'read', 'leads.read', 'View leads'),
    ('leads', 'update', 'leads.update', 'Update lead details'),
    ('leads', 'delete', 'leads.delete', 'Delete leads')
ON CONFLICT (key) DO NOTHING;

-- Products entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('products', 'create', 'products.create', 'Create new products'),
    ('products', 'read', 'products.read', 'View products'),
    ('products', 'update', 'products.update', 'Update product details'),
    ('products', 'delete', 'products.delete', 'Delete products')
ON CONFLICT (key) DO NOTHING;

-- Campaigns entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('campaigns', 'create', 'campaigns.create', 'Create new campaigns'),
    ('campaigns', 'read', 'campaigns.read', 'View campaigns'),
    ('campaigns', 'update', 'campaigns.update', 'Update campaign details'),
    ('campaigns', 'delete', 'campaigns.delete', 'Delete campaigns')
ON CONFLICT (key) DO NOTHING;

-- Tickets entity permissions
INSERT INTO public.permissions (entity, operation, key, description) VALUES
    ('tickets', 'create', 'tickets.create', 'Create new tickets'),
    ('tickets', 'read', 'tickets.read', 'View tickets'),
    ('tickets', 'update', 'tickets.update', 'Update ticket details'),
    ('tickets', 'delete', 'tickets.delete', 'Delete tickets')
ON CONFLICT (key) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE slug = 'admin'),
    id
FROM public.permissions
ON CONFLICT DO NOTHING;

-- Assign read permissions and some create/update to manager role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE slug = 'manager'),
    id
FROM public.permissions
WHERE operation IN ('read', 'create', 'update')
    AND entity IN ('leads', 'products', 'campaigns', 'tickets', 'users')
ON CONFLICT DO NOTHING;

-- Assign only read permissions to viewer role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE slug = 'viewer'),
    id
FROM public.permissions
WHERE operation = 'read'
ON CONFLICT DO NOTHING;

-- Create permission bundles
INSERT INTO public.permission_bundles (name, description) VALUES
    ('Full Access', 'Complete access to all resources'),
    ('Read Only', 'View-only access to all resources'),
    ('Lead Management', 'Full access to leads'),
    ('Product Management', 'Full access to products')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to bundles
-- Full Access bundle
INSERT INTO public.bundle_permissions (bundle_id, permission_id)
SELECT 
    (SELECT id FROM public.permission_bundles WHERE name = 'Full Access'),
    id
FROM public.permissions
ON CONFLICT DO NOTHING;

-- Read Only bundle
INSERT INTO public.bundle_permissions (bundle_id, permission_id)
SELECT 
    (SELECT id FROM public.permission_bundles WHERE name = 'Read Only'),
    id
FROM public.permissions
WHERE operation = 'read'
ON CONFLICT DO NOTHING;

-- Lead Management bundle
INSERT INTO public.bundle_permissions (bundle_id, permission_id)
SELECT 
    (SELECT id FROM public.permission_bundles WHERE name = 'Lead Management'),
    id
FROM public.permissions
WHERE entity = 'leads'
ON CONFLICT DO NOTHING;

-- Product Management bundle
INSERT INTO public.bundle_permissions (bundle_id, permission_id)
SELECT 
    (SELECT id FROM public.permission_bundles WHERE name = 'Product Management'),
    id
FROM public.permissions
WHERE entity = 'products'
ON CONFLICT DO NOTHING;

-- Note: Test users must be created via Supabase Auth
-- Use the following credentials for testing (create manually or via API):
-- admin@example.com / password123 (assign admin role)
-- manager@example.com / password123 (assign manager role)
-- viewer@example.com / password123 (assign viewer role)

-- After creating auth users, run this to assign roles:
-- UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'admin') WHERE email = 'admin@example.com';
-- UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'manager') WHERE email = 'manager@example.com';
-- UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'viewer') WHERE email = 'viewer@example.com';
