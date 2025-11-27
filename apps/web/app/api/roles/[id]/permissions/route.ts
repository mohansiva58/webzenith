import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RoleService } from '@/services/roles';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { assignPermissionSchema } from '@/lib/validations';

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

// POST /api/roles/[id]/permissions - Assign permissions to role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkPermission('roles.update');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    const validation = assignPermissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const roleService = new RoleService(supabase);
    await roleService.assignPermissions(id, validation.data.permission_ids);

    return NextResponse.json({ data: { success: true } }, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning permissions:', error);
    
    // Handle duplicate permission assignment
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Some permissions are already assigned to this role' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
