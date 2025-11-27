import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RoleService } from '@/services/roles';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';

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

// DELETE /api/roles/[id]/permissions/[permId] - Remove permission from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; permId: string }> }
) {
  try {
    const { id, permId } = await params;
    const result = await checkPermission('roles.update');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const roleService = new RoleService(supabase);
    await roleService.removePermission(id, permId);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error removing permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
