import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RoleService } from '@/services/roles';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { createRoleSchema, updateRoleSchema } from '@/lib/validations';
import { z } from 'zod';

// Helper function to check permissions
async function checkPermission(permissionKey: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userService = new UserService(supabase);
  const profile = await userService.getProfile(user.id);

  if (!profile) {
    return { error: 'User profile not found', status: 404 };
  }

  if (!hasPermission(profile.permissions, permissionKey as any)) {
    return { error: 'Forbidden: Insufficient permissions', status: 403 };
  }

  return { user, supabase };
}

// GET /api/roles - List all roles
export async function GET() {
  try {
    const result = await checkPermission('roles.read');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const roleService = new RoleService(supabase);
    const roles = await roleService.getAll();

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const result = await checkPermission('roles.create');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    // Validate request body
    const validation = createRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const roleService = new RoleService(supabase);
    const role = await roleService.create(validation.data);

    return NextResponse.json({ data: role }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Role with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
