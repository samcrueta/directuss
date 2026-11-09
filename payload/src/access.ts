import type { Access, FieldAccess, Where } from 'payload'

type Role = 'admin' | 'editor' | 'service'

export function roleOf(user: unknown): Role | undefined {
  return (user as { role?: Role } | null | undefined)?.role
}

export const isAdmin = (user: unknown) => roleOf(user) === 'admin'
export const isStaff = (user: unknown) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'service' || role === 'editor'
}

export const anyone: Access = () => true
export const authenticated: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const staffOnly: Access = ({ req }) => isStaff(req.user)
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(req.user)
export const staffFieldOnly: FieldAccess = ({ req }) => isStaff(req.user)

export const publishedComponents: Access = ({ req }) => {
  if (isStaff(req.user)) return true
  return {
    and: [
      { status: { equals: 'published' } },
      { surface: { equals: 'public' } },
    ],
  } as Where
}
