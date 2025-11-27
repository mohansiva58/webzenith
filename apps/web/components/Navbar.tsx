'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { Shield, Users, Key, Package, LogOut, Home } from 'lucide-react'

export function Navbar() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
    { href: '/roles', label: 'Roles', icon: Shield, show: can('roles.read') },
    { href: '/permissions', label: 'Permissions', icon: Key, show: can('permissions.read') },
    { href: '/users', label: 'Users', icon: Users, show: can('users.read') },
    { href: '/bundles', label: 'Bundles', icon: Package, show: can('permissions.create') },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                RBAC System
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{user.name || user.email}</span>
              <span className="text-xs text-muted-foreground">{user.role?.name || 'No Role'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {user.role?.name || 'No Role'}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
