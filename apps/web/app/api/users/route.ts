import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { createUserSchema, updateUserSchema } from '@/lib/validations';

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

// GET /api/users - List all users
export async function GET() {
  try {
    const result = await checkPermission('users.read');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const userService = new UserService(supabase);
    const users = await userService.getAll();

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const result = await checkPermission('users.create');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name, role_id } = validation.data;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Update user role (trigger already created the user in public.users)
    const userService = new UserService(supabase);
    await userService.update(authData.user.id, { role_id, name });

    const user = await userService.getById(authData.user.id);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
