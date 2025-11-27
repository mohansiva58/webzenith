import { z } from 'zod';

// Role schemas
export const createRoleSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Name is required'),
  disabled: z.boolean().optional().default(false),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  disabled: z.boolean().optional(),
});

// Permission schemas
export const createPermissionSchema = z.object({
  entity: z.string().min(1, 'Entity is required'),
  operation: z.string().min(1, 'Operation is required'),
  description: z.string().optional(),
});

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role_id: z.string().uuid('Invalid role ID'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role_id: z.string().uuid('Invalid role ID').optional(),
});

// Role permission schemas
export const assignPermissionSchema = z.object({
  permission_ids: z.array(z.string().uuid('Invalid permission ID')).min(1, 'At least one permission required'),
});

// Permission bundle schemas
export const createBundleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permission_ids: z.array(z.string().uuid('Invalid permission ID')).optional(),
});

export const updateBundleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
});

export const assignBundleToRoleSchema = z.object({
  bundle_id: z.string().uuid('Invalid bundle ID'),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

// Type exports
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>;
export type AssignBundleToRoleInput = z.infer<typeof assignBundleToRoleSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
