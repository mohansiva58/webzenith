"use client"
import { useAuth } from './useAuth'
import { hasPermission } from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()

  function can(key: string) {
    return hasPermission(user?.permissions, key as any)
  }

  function canAny(keys: string[]) {
    return keys.some(k => hasPermission(user?.permissions, k as any))
  }

  function canAll(keys: string[]) {
    return keys.every(k => hasPermission(user?.permissions, k as any))
  }

  return { can, canAny, canAll }
}

export default usePermissions
