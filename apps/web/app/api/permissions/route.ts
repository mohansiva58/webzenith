import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PermissionService } from '@/services/permissions';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { createPermissionSchema } from '@/lib/validations';

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

// GET /api/permissions - List all permissions
export async function GET() {
  try {
    const result = await checkPermission('permissions.read');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const permissionService = new PermissionService(supabase);
    const permissions = await permissionService.getAll();

    return NextResponse.json({ data: permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/permissions - Create a new permission
export async function POST(request: NextRequest) {
  try {
    const result = await checkPermission('permissions.create');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    const validation = createPermissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const permissionService = new PermissionService(supabase);
    const permission = await permissionService.create(validation.data);

    return NextResponse.json({ data: permission }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating permission:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Permission with this key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
