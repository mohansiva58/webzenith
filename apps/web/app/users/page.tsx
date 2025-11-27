"use client"
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Loader2, UserPlus, Users, Shield } from 'lucide-react'

// Minimal local Badge component to avoid missing import errors.
// It intentionally accepts className and variant props so existing usages continue to work.
const Badge: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: string }> = ({ children, className = '', ...props }) => {
  return (
    <div {...props} className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${className}`}>
      {children}
    </div>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [error, setError] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const json = await res.json()
      return json.data
    }
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles')
      if (!res.ok) throw new Error('Failed to fetch roles')
      const json = await res.json()
      return json.data
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; password: string; role_id: string }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEmail('')
      setName('')
      setPassword('')
      setRoleId('')
      setError('')
    },
    onError: (err: any) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!roleId) {
      setError('Please select a role')
      return
    }
    setError('')
    createMutation.mutate({ email, name, password, role_id: roleId })
  }

  const getRoleColor = (roleName: string) => {
    const colors = {
      admin: 'bg-[#E4580B] text-white',
      user: 'bg-[#6793AC] text-white',
      moderator: 'bg-[#114AB1] text-white',
    }
    return colors[roleName.toLowerCase() as keyof typeof colors] || 'bg-gray-200 text-gray-800'
  }

  return (
    <ProtectedRoute permission="users.read">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Users className="h-8 w-8 text-[#114AB1]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage team members and their permissions</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2 bg-white border border-gray-200">
              {users?.length || 0} Users
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Create User Card */}
            <Card className="lg:col-span-1 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#114AB1] to-[#6793AC] text-white pb-6">
                <div className="flex items-center space-x-3">
                  <UserPlus className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-white text-xl">Add New User</CardTitle>
                    <CardDescription className="text-blue-100">
                      Create a new team member account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#114AB1] focus:border-transparent transition-all"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#114AB1] focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#114AB1] focus:border-transparent transition-all"
                      placeholder="Create a password"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      User Role
                    </Label>
                    <select
                      id="role"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#114AB1] focus:border-transparent transition-all bg-white"
                      value={roleId}
                      onChange={e => setRoleId(e.target.value)}
                      required
                    >
                      <option value="">Select a role...</option>
                      {roles?.map((role: any) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#114AB1] to-[#6793AC] hover:from-[#0E3A8C] hover:to-[#5A82A0] text-white py-3 px-6 rounded-xl font-semibold shadow-sm transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-5">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-[#E4580B]" />
                    <div>
                      <CardTitle className="text-gray-900 text-xl">Team Members</CardTitle>
                      <CardDescription className="text-gray-600">
                        Active users and their roles
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#114AB1]" />
                      <span className="ml-3 text-gray-600">Loading users...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#6793AC] transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#114AB1] to-[#6793AC] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#114AB1] transition-colors">
                                {user.name}
                              </h3>
                              <p className="text-gray-600 text-sm">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getRoleColor(user.role?.name)} px-3 py-1 rounded-full font-medium`}>
                              {user.role?.name || 'No Role'}
                            </Badge>
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                          </div>
                        </div>
                      ))}
                      
                      {!users?.length && (
                        <div className="text-center py-12">
                          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-gray-600">Get started by creating your first team member.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}