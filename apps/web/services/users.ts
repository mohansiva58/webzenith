import { SupabaseClient } from '@supabase/supabase-js';
import { User, UserWithRole, UserProfile } from '@/types';

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<UserWithRole[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        role:roles(
          *,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform nested permissions
    return (data || []).map((user: any) => {
      if (user.role && user.role.permissions) {
        user.role.permissions = user.role.permissions.map((rp: any) => rp.permission);
      }
      return user;
    });
  }

  async getById(id: string): Promise<UserWithRole | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        role:roles(
          *,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    // Transform nested permissions
    if (data.role && data.role.permissions) {
      data.role.permissions = data.role.permissions.map((rp: any) => rp.permission);
    }

    return data;
  }

  async update(id: string, updates: { name?: string; role_id?: string }): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.getById(userId);
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.role?.permissions || [],
    };
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    return this.update(userId, { role_id: roleId });
  }
}
