// Database Types
export interface Role {
  id: string;
  slug: string;
  name: string;
  disabled: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  entity: string;
  operation: string;
  key: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: string | null;
  created_at: string;
}

export interface PermissionBundle {
  id: string;
  name: string;
  description: string | null;
}

export interface BundlePermission {
  id: string;
  bundle_id: string;
  permission_id: string;
}

// Extended Types with Relations
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRole extends User {
  role: RoleWithPermissions | null;
}

export interface BundleWithPermissions extends PermissionBundle {
  permissions: Permission[];
}

// API Response Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: RoleWithPermissions | null;
  permissions: Permission[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Permission Operation Types
export type PermissionOperation = 'create' | 'read' | 'update' | 'delete';

export type PermissionEntity = 'users' | 'roles' | 'permissions' | 'leads' | 'products' | 'campaigns' | 'tickets';

// Helper type for permission key
export type PermissionKey = `${string}.${string}`;
