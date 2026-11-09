type SessionLike = {
  data?: {
    role?: string | null
  } | null
} | null

type AccessArgs = {
  session?: SessionLike
}

type FilterArgs = {
  session?: SessionLike
}

export function isStaff(session: SessionLike | undefined) {
  const role = session?.data?.role
  return role === 'admin' || role === 'editor'
}

export function isAdmin(session: SessionLike | undefined) {
  return session?.data?.role === 'admin'
}

export const anyone = () => true

export const staffOnly = ({ session }: AccessArgs) => isStaff(session)

export const adminOnly = ({ session }: AccessArgs) => isAdmin(session)

export const staffFieldRead = ({ session }: AccessArgs) => isStaff(session)

export const adminFieldWrite = ({ session }: AccessArgs) => isAdmin(session)

export const publishedLessonFilter = ({ session }: FilterArgs) =>
  isStaff(session) ? true : { published: { equals: true } }

export const publishedComponentFilter = ({ session }: FilterArgs) =>
  isStaff(session)
    ? true
    : {
        status: { equals: 'published' },
        surface: { equals: 'public' },
      }

export const staffListAccess = {
  operation: {
    query: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
}

export const adminListAccess = {
  operation: {
    query: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
}

export const publicListAccess = {
  operation: {
    query: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
}
