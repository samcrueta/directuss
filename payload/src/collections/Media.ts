import type { CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Showcase',
  },
  access: {
    read: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || './media',
    mimeTypes: ['image/*'],
  },
}
