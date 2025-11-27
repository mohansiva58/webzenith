import { SupabaseClient } from '@supabase/supabase-js';
import { PermissionBundle, BundleWithPermissions } from '@/types';

export class BundleService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<BundleWithPermissions[]> {
    const { data, error } = await this.supabase
      .from('permission_bundles')
      .select(`
        *,
        permissions:bundle_permissions(
          permission:permissions(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform nested structure
    return (data || []).map((bundle: any) => ({
      ...bundle,
      permissions: bundle.permissions?.map((bp: any) => bp.permission) || [],
    }));
  }

  async getById(id: string): Promise<BundleWithPermissions | null> {
    const { data, error } = await this.supabase
      .from('permission_bundles')
      .select(`
        *,
        permissions:bundle_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    // Transform nested structure
    return {
      ...data,
      permissions: data.permissions?.map((bp: any) => bp.permission) || [],
    };
  }

  async create(bundle: {
    name: string;
    description?: string;
    permission_ids?: string[];
  }): Promise<PermissionBundle> {
    const { permission_ids, ...bundleData } = bundle;

    const { data, error } = await this.supabase
      .from('permission_bundles')
      .insert(bundleData)
      .select()
      .single();

    if (error) throw error;

    // Assign permissions if provided
    if (permission_ids && permission_ids.length > 0) {
      await this.assignPermissions(data.id, permission_ids);
    }

    return data;
  }

  async update(
    id: string,
    updates: { name?: string; description?: string }
  ): Promise<PermissionBundle> {
    const { data, error } = await this.supabase
      .from('permission_bundles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('permission_bundles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async assignPermissions(bundleId: string, permissionIds: string[]): Promise<void> {
    const bundlePermissions = permissionIds.map(permissionId => ({
      bundle_id: bundleId,
      permission_id: permissionId,
    }));

    const { error } = await this.supabase
      .from('bundle_permissions')
      .insert(bundlePermissions);

    if (error) throw error;
  }

  async removePermission(bundleId: string, permissionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bundle_permissions')
      .delete()
      .eq('bundle_id', bundleId)
      .eq('permission_id', permissionId);

    if (error) throw error;
  }
}
