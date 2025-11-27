"use client"
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Edit2, Check, X, Shield } from 'lucide-react'

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params?.id as string

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [nameError, setNameError] = useState('')

  const { data: role, isLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      const res = await fetch(`/api/roles/${id}`)
      if (!res.ok) throw new Error('Failed to fetch role')
      const json = await res.json()
      return json.data
    }
  })

  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions')
      if (!res.ok) throw new Error('Failed to fetch permissions')
      const json = await res.json()
      return json.data
    }
  })

  useEffect(() => {
    if (role?.name) {
      setEditedName(role.name)
    }
  }, [role?.name])

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update role')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsEditingName(false)
      setNameError('')
    },
    onError: (err: any) => {
      setNameError(err.message)
    },
  })

  const assignMutation = useMutation({
    mutationFn: async (permIds: string[]) => {
      const res = await fetch(`/api/roles/${id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: permIds }),
      })
      if (!res.ok) throw new Error('Failed to assign permissions')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', id] }),
  })

  const removeMutation = useMutation({
    mutationFn: async (permId: string) => {
      const res = await fetch(`/api/roles/${id}/permissions/${permId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove permission')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', id] }),
  })

  const [selectedPerms, setSelectedPerms] = useState<string[]>([])

  function handleAssign() {
    if (selectedPerms.length > 0) {
      assignMutation.mutate(selectedPerms)
      setSelectedPerms([])
    }
  }

  function handleSaveName() {
    if (!editedName.trim()) {
      setNameError('Role name cannot be empty')
      return
    }
    updateNameMutation.mutate(editedName)
  }

  function handleCancelEdit() {
    setIsEditingName(false)
    setEditedName(role?.name || '')
    setNameError('')
  }

  if (isLoading) return <div className="p-8">Loading...</div>

  const assignedIds = new Set(role?.permissions?.map((p: any) => p.id) || [])
  const unassigned = allPermissions?.filter((p: any) => !assignedIds.has(p.id)) || []

  return (
    <ProtectedRoute permission="roles.read">
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Role Details Card with Edit Name */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  {isEditingName ? (
                    <div className="space-y-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-xl font-bold h-10"
                        placeholder="Role name"
                        autoFocus
                      />
                      {nameError && (
                        <p className="text-sm text-destructive">{nameError}</p>
                      )}
                    </div>
                  ) : (
                    <CardTitle className="text-2xl">{role?.name}</CardTitle>
                  )}
                  <CardDescription>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">
                      {role?.slug}
                    </code>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveName}
                      disabled={updateNameMutation.isPending}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={updateNameMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingName(true)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Name
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Status:</span>
              {role?.disabled ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                  Disabled
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                  Active
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Permissions</CardTitle>
            <CardDescription>
              Permissions currently assigned to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role?.permissions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No permissions assigned yet</p>
            ) : (
              <div className="space-y-2">
                {role?.permissions?.map((perm: any) => (
                  <div key={perm.id} className="flex justify-between items-center border p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <code className="text-sm font-mono font-medium">{perm.key}</code>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removeMutation.mutate(perm.id)}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Add Permissions</CardTitle>
            <CardDescription>
              Select permissions to assign to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unassigned.length === 0 ? (
              <p className="text-muted-foreground text-sm">All permissions are already assigned</p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4 border rounded-lg p-3">
                  {unassigned.map((perm: any) => (
                    <label 
                      key={perm.id} 
                      className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                    >
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
                        className="mt-1"
                      />
                      <div>
                        <code className="text-sm font-mono font-medium">{perm.key}</code>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <Button 
                  onClick={handleAssign} 
                  disabled={selectedPerms.length === 0 || assignMutation.isPending}
                  className="w-full"
                >
                  {assignMutation.isPending ? 'Assigning...' : `Assign Selected (${selectedPerms.length})`}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Roles
        </Button>
      </div>
    </ProtectedRoute>
  )
}
