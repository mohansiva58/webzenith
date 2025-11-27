import { SupabaseClient } from '@supabase/supabase-js';

export interface Permission {
  id: string;
  slug: string;
  name: string;
}

export interface Role {
  id: string;
  slug: string;
  name: string;
  disabled?: boolean;
  created_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export class RoleService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<RoleWithPermissions | null> {
    const { data, error } = await this.supabase
      .from('roles')
      .select(`
        *,
        permissions:role_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    // Transform the nested structure
    const permissions = data.permissions?.map((rp: any) => rp.permission) || [];
    return {
      ...data,
      permissions,
    };
  }

  async create(role: { slug: string; name: string; disabled?: boolean }): Promise<Role> {
    const { data, error } = await this.supabase
      .from('roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: { name?: string; disabled?: boolean }): Promise<Role> {
    const { data, error } = await this.supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Insert new role-permission associations
    const rolePermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const { error } = await this.supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (error) throw error;
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) throw error;
  }

  async assignBundle(roleId: string, bundleId: string): Promise<void> {
    // Get all permissions in the bundle
    const { data: bundlePermissions, error: fetchError } = await this.supabase
      .from('bundle_permissions')
      .select('permission_id')
      .eq('bundle_id', bundleId);

    if (fetchError) throw fetchError;

    const permissionIds = bundlePermissions?.map(bp => bp.permission_id) || [];
    
    if (permissionIds.length > 0) {
      await this.assignPermissions(roleId, permissionIds);
    }
  }
}
