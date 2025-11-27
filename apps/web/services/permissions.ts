import { SupabaseClient } from '@supabase/supabase-js';
import { Permission } from '@/types';
import { buildKey } from '@/lib/permissions';

export class PermissionService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .order('entity', { ascending: true })
      .order('operation', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Permission | null> {
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(permission: {
    entity: string;
    operation: string;
    description?: string;
  }): Promise<Permission> {
    const key = buildKey(permission.entity, permission.operation);

    const { data, error } = await this.supabase
      .from('permissions')
      .insert({
        ...permission,
        key,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('permissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByRoleId(roleId: string): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('role_permissions')
      .select('permission:permissions(*)')
      .eq('role_id', roleId);

    if (error) throw error;
    
    return data?.map((rp: any) => rp.permission) || [];
  }

  async getEntities(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('permissions')
      .select('entity')
      .order('entity', { ascending: true });

    if (error) throw error;
    
    const entities = [...new Set(data?.map(p => p.entity) || [])];
    return entities;
  }

  async getOperations(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('permissions')
      .select('operation')
      .order('operation', { ascending: true });

    if (error) throw error;
    
    const operations = [...new Set(data?.map(p => p.operation) || [])];
    return operations;
  }
}
