import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/services/users';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with role and permissions
    const userService = new UserService(supabase);
    const profile = await userService.getProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
