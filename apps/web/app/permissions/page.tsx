"use client"
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function PermissionsPage() {
  const queryClient = useQueryClient()
  const [entity, setEntity] = useState('')
  const [operation, setOperation] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions')
      if (!res.ok) throw new Error('Failed to fetch permissions')
      const json = await res.json()
      return json.data
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: { entity: string; operation: string; description?: string }) => {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create permission')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      setEntity('')
      setOperation('')
      setDescription('')
      setError('')
    },
    onError: (err: any) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    createMutation.mutate({ entity, operation, description: description || undefined })
  }

  // Group by entity
  const grouped: Record<string, any[]> = {}
  data?.forEach((perm: any) => {
    if (!grouped[perm.entity]) grouped[perm.entity] = []
    grouped[perm.entity].push(perm)
  })

  return (
    <ProtectedRoute permission="permissions.read">
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Permissions</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create New Permission</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="entity">Entity</Label>
                <Input id="entity" value={entity} onChange={e => setEntity(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="operation">Operation</Label>
                <Input id="operation" value={operation} onChange={e => setOperation(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Permission'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <p>Loading permissions...</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(grouped).map(ent => (
              <Card key={ent}>
                <CardHeader>
                  <CardTitle className="text-lg">{ent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {grouped[ent].map((perm: any) => (
                      <li key={perm.id} className="text-sm">
                        <span className="font-mono">{perm.key}</span>
                        {perm.description && <span className="text-muted-foreground ml-2">— {perm.description}</span>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
