/**
 * Minimal local types to avoid depending on an external '@rbac/types' package.
 * Replace these with the proper import when a shared types package is available.
 */
export type PermissionKey = string;

export type Permission = {
  key: PermissionKey;
  entity: string;
  operation: string;
};

/**
 * Build a permission key from entity and operation
 * @param entity - The entity (e.g., 'users', 'leads')
 * @param operation - The operation (e.g., 'create', 'read', 'update', 'delete')
 * @returns Permission key in format 'entity.operation'
 */
export function buildKey(entity: string, operation: string): PermissionKey {
  return `${entity}.${operation}` as PermissionKey;
}

/**
 * Check if a user has a specific permission
 * @param permissions - Array of user's permissions
 * @param key - Permission key to check (e.g., 'users.create')
 * @returns True if user has the permission
 */
export function hasPermission(
  permissions: Permission[] | undefined,
  key: PermissionKey
): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }
  
  return permissions.some(permission => permission.key === key);
}

/**
 * Check if a user has multiple permissions (AND logic)
 * @param permissions - Array of user's permissions
 * @param keys - Array of permission keys to check
 * @returns True if user has all the permissions
 */
export function hasAllPermissions(
  permissions: Permission[] | undefined,
  keys: PermissionKey[]
): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }
  
  return keys.every(key => hasPermission(permissions, key));
}

/**
 * Check if a user has any of the specified permissions (OR logic)
 * @param permissions - Array of user's permissions
 * @param keys - Array of permission keys to check
 * @returns True if user has at least one of the permissions
 */
export function hasAnyPermission(
  permissions: Permission[] | undefined,
  keys: PermissionKey[]
): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }
  
  return keys.some(key => hasPermission(permissions, key));
}

/**
 * Group permissions by entity
 * @param permissions - Array of permissions
 * @returns Object with entities as keys and permissions as values
 */
export function groupPermissionsByEntity(
  permissions: Permission[]
): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.entity]) {
      acc[permission.entity] = [];
    }
    acc[permission.entity].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}

/**
 * Extract entity and operation from a permission key
 * @param key - Permission key (e.g., 'users.create')
 * @returns Object with entity and operation
 */
export function parsePermissionKey(key: PermissionKey): {
  entity: string;
  operation: string;
} {
  const [entity, operation] = key.split('.');
  return { entity, operation };
}
