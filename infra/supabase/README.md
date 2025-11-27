# Supabase Setup Guide

## Local Development with Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project (if not already done):
```bash
supabase init
```

3. Start local Supabase:
```bash
supabase start
```

4. Apply migrations:
```bash
supabase db reset
```

5. Run seed script:
```bash
psql -h localhost -p 54322 -U postgres -d postgres -f infra/supabase/seed.sql
```

## Remote Supabase Setup

1. Create a new project at https://supabase.com

2. Get your project credentials:
   - Go to Project Settings > API
   - Copy `URL` and `anon` key
   - Copy `service_role` key (for server-side operations)

3. Run migrations via Supabase Dashboard:
   - Go to SQL Editor
   - Copy and paste the content of `migrations/001_initial_schema.sql`
   - Execute

4. Run seed script:
   - In SQL Editor, copy and paste the content of `seed.sql`
   - Execute

5. Create test users:
   - Go to Authentication > Users
   - Add users:
     - admin@example.com (password: password123)
     - manager@example.com (password: password123)
     - viewer@example.com (password: password123)

6. Assign roles to users (run in SQL Editor):
```sql
UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'admin') WHERE email = 'admin@example.com';
UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'manager') WHERE email = 'manager@example.com';
UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'viewer') WHERE email = 'viewer@example.com';
```

7. Update your `.env` file with the credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup

After running migrations and seeds, you should have:
- 3 roles: admin, manager, viewer
- 28 permissions (7 entities × 4 operations each)
- 4 permission bundles
- Role-permission assignments for each role

## Database Schema

- `roles` - User roles with enable/disable functionality
- `permissions` - Fine-grained permissions following entity.operation pattern
- `role_permissions` - Many-to-many relationship between roles and permissions
- `users` - User profiles linked to auth.users with role assignment
- `permission_bundles` - Groups of permissions for bulk assignment
- `bundle_permissions` - Many-to-many relationship between bundles and permissions
