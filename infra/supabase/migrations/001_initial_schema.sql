-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity TEXT NOT NULL,
    operation TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permission_bundles table
CREATE TABLE IF NOT EXISTS public.permission_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bundle_permissions junction table
CREATE TABLE IF NOT EXISTS public.bundle_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES public.permission_bundles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bundle_id, permission_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_bundle_permissions_bundle_id ON public.bundle_permissions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON public.permissions(key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Note: In production, these should be more restrictive based on user permissions

-- Roles policies
CREATE POLICY "Allow authenticated users to read roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert roles" ON public.roles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update roles" ON public.roles
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete roles" ON public.roles
    FOR DELETE TO authenticated USING (true);

-- Permissions policies
CREATE POLICY "Allow authenticated users to read permissions" ON public.permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert permissions" ON public.permissions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update permissions" ON public.permissions
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete permissions" ON public.permissions
    FOR DELETE TO authenticated USING (true);

-- Role permissions policies
CREATE POLICY "Allow authenticated users to read role_permissions" ON public.role_permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert role_permissions" ON public.role_permissions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete role_permissions" ON public.role_permissions
    FOR DELETE TO authenticated USING (true);

-- Users policies
CREATE POLICY "Allow users to read their own data" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to read all users" ON public.users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert users" ON public.users
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update users" ON public.users
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete users" ON public.users
    FOR DELETE TO authenticated USING (true);

-- Permission bundles policies
CREATE POLICY "Allow authenticated users to read bundles" ON public.permission_bundles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert bundles" ON public.permission_bundles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update bundles" ON public.permission_bundles
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete bundles" ON public.permission_bundles
    FOR DELETE TO authenticated USING (true);

-- Bundle permissions policies
CREATE POLICY "Allow authenticated users to read bundle_permissions" ON public.bundle_permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert bundle_permissions" ON public.bundle_permissions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete bundle_permissions" ON public.bundle_permissions
    FOR DELETE TO authenticated USING (true);

-- Create function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
