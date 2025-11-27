'use client'
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Key, Package, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { can } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Role-Based Access Control System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful, enterprise-grade RBAC solution with granular permission management
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Shield, title: 'Custom Roles', desc: 'Unlimited role creation' },
              { icon: Key, title: 'Permissions', desc: 'Entity-operation based' },
              { icon: Users, title: 'User Management', desc: 'Role assignment' },
              { icon: Package, title: 'Bundles', desc: 'Permission grouping' },
            ].map((feature, i) => (
              <Card key={i} className="border-2">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  const quickActions = [
    { href: '/roles', icon: Shield, title: 'Manage Roles', desc: 'Create and configure roles', show: can('roles.read'), color: 'from-blue-500 to-blue-600' },
    { href: '/permissions', icon: Key, title: 'Permissions', desc: 'Define access controls', show: can('permissions.read'), color: 'from-purple-500 to-purple-600' },
    { href: '/users', icon: Users, title: 'Users', desc: 'Manage user accounts', show: can('users.read'), color: 'from-green-500 to-green-600' },
    { href: '/bundles', icon: Package, title: 'Bundles', desc: 'Group permissions', show: can('permissions.create'), color: 'from-orange-500 to-orange-600' },
  ]

  const stats = [
    { label: 'Your Role', value: user.role?.name || 'None' },
    { label: 'Permissions', value: user.permissions?.length || 0 },
    { label: 'Status', value: 'Active', icon: CheckCircle2 },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="text-muted-foreground">
            Manage your access control system from this dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  {stat.icon && <stat.icon className="h-8 w-8 text-green-500" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.filter(action => action.show).map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} mb-2`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{action.title}</CardTitle>
                    <CardDescription>{action.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {user.permissions && user.permissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>You have access to the following operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.permissions.slice(0, 12).map((perm: any) => (
                  <div key={perm.id} className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
                    {perm.key}
                  </div>
                ))}
                {user.permissions.length > 12 && (
                  <div className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
                    +{user.permissions.length - 12} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
