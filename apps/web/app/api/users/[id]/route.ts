import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { updateUserSchema } from '@/lib/validations';

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

// GET /api/users/[id] - Get user by ID with permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkPermission('users.read');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const userService = new UserService(supabase);
    const user = await userService.getById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert to profile format with effective permissions
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.role?.permissions || [],
    };

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkPermission('users.update');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const userService = new UserService(supabase);
    const user = await userService.update(id, validation.data);

    return NextResponse.json({ data: user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkPermission('users.delete');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    
    // Delete from auth (cascades to public.users)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
