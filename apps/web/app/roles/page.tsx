"use client"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Plus, Eye, Power, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function RolesPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles')
      if (!res.ok) throw new Error('Failed to fetch roles')
      const json = await res.json()
      return json.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete role')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, disabled }: { id: string; disabled: boolean }) => {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      })
      if (!res.ok) throw new Error('Failed to update role')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  return (
    <ProtectedRoute permission="roles.read">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Roles Management
              </h1>
              <p className="text-muted-foreground">
                Create and manage custom roles for your organization
              </p>
            </div>
            <Link href="/roles/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Role
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading roles...</p>
              </div>
            </div>
          ) : data?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No roles yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Get started by creating your first role</p>
                <Link href="/roles/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.map((role: any) => (
                <Card key={role.id} className="group hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          {role.name}
                        </CardTitle>
                        <CardDescription>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">
                            {role.slug}
                          </code>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {role.disabled ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                            <XCircle className="h-3 w-3" />
                            Disabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/roles/${role.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => toggleMutation.mutate({ id: role.id, disabled: !role.disabled })}
                      >
                        <Power className="h-4 w-4" />
                        {role.disabled ? 'Enable' : 'Disable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          if (confirm(`Delete role "${role.name}"? This action cannot be undone.`)) {
                            deleteMutation.mutate(role.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
