"use client"
import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'

export function ProtectedRoute({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = usePermissions()
  const router = useRouter()

  if (!can(permission)) {
    // client-side redirect to 403
    if (typeof window !== 'undefined') {
      router.replace('/403')
      return null
    }
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
