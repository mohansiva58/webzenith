"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UserProfile } from '@/types'

const AuthContext = createContext<{
  user: UserProfile | null
  isLoading: boolean
  refetch: () => Promise<unknown>
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/me')
      if (!res.ok) throw new Error('Not authenticated')
      const json = await res.json()
      return json.data as UserProfile
    },
    retry: false,
    refetchOnWindowFocus: false
  })

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading, refetch: () => refetch() }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default useAuth
