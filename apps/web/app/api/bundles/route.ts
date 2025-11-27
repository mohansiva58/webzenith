import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BundleService } from '@/services/bundles';
import { UserService } from '@/services/users';
import { hasPermission } from '@/lib/permissions';
import { createBundleSchema } from '@/lib/validations';

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

// GET /api/bundles - List all permission bundles
export async function GET() {
  try {
    const result = await checkPermission('permissions.read');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const bundleService = new BundleService(supabase);
    const bundles = await bundleService.getAll();

    return NextResponse.json({ data: bundles });
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bundles - Create a new permission bundle
export async function POST(request: NextRequest) {
  try {
    const result = await checkPermission('permissions.create');
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { supabase } = result;
    const body = await request.json();

    const validation = createBundleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const bundleService = new BundleService(supabase);
    const bundle = await bundleService.create(validation.data);

    return NextResponse.json({ data: bundle }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bundle:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Bundle with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
