import type { CollectionConfig } from 'payload'

import { adminFieldOnly, adminOnly, authenticated, isAdmin, isStaff } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
    tokenExpiration: 7200,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'name', 'role'],
  },
  access: {
    read: authenticated,
    create: adminOnly,
    update: ({ req, id }) => isAdmin(req.user) || req.user?.id === id,
    delete: adminOnly,
    admin: ({ req }) => isStaff(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Display name for the admin panel.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Service', value: 'service' },
      ],
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      admin: {
        description: 'Admins manage everything. Editors use the admin. The service account is used by the Lumina course app.',
      },
    },
  ],
}
