"use client"
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function BundlesPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [error, setError] = useState('')

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const res = await fetch('/api/bundles')
      if (!res.ok) throw new Error('Failed to fetch bundles')
      const json = await res.json()
      return json.data
    }
  })

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions')
      if (!res.ok) throw new Error('Failed to fetch permissions')
      const json = await res.json()
      return json.data
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; permission_ids?: string[] }) => {
      const res = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create bundle')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
      setName('')
      setDescription('')
      setSelectedPerms([])
      setError('')
    },
    onError: (err: any) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    createMutation.mutate({
      name,
      description: description || undefined,
      permission_ids: selectedPerms.length > 0 ? selectedPerms : undefined,
    })
  }

  return (
    <ProtectedRoute permission="permissions.create">
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Permission Bundles</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create New Bundle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Bundle Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Select Permissions</Label>
                <div className="border p-3 rounded max-h-48 overflow-y-auto space-y-1">
                  {permissions?.map((perm: any) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(perm.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedPerms([...selectedPerms, perm.id])
                          } else {
                            setSelectedPerms(selectedPerms.filter(id => id !== perm.id))
                          }
                        }}
                      />
                      <span className="text-sm">{perm.key}</span>
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Bundle'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <p>Loading bundles...</p>
        ) : (
          <div className="space-y-3">
            {bundles?.map((bundle: any) => (
              <Card key={bundle.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{bundle.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {bundle.description && <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>}
                  <p className="text-sm">Permissions: {bundle.permissions?.length || 0}</p>
                  <ul className="text-xs mt-2 space-y-1">
                    {bundle.permissions?.map((perm: any) => (
                      <li key={perm.id} className="font-mono">{perm.key}</li>
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
