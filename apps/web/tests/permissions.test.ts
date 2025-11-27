import { describe, it, expect } from 'vitest'
import { hasPermission, buildKey } from '@/lib/permissions'

const samplePermissions = [
  { id: '1', entity: 'leads', operation: 'create', key: 'leads.create', description: null },
  { id: '2', entity: 'leads', operation: 'read', key: 'leads.read', description: null },
]

describe('permission helpers', () => {
  it('buildKey produces correct keys', () => {
    expect(buildKey('leads', 'create')).toBe('leads.create')
  })

  it('hasPermission returns true if present', () => {
    expect(hasPermission(samplePermissions as any, 'leads.create' as any)).toBe(true)
  })

  it('hasPermission returns false if missing', () => {
    expect(hasPermission(samplePermissions as any, 'products.create' as any)).toBe(false)
  })
})
