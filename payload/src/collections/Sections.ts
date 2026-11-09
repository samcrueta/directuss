import type { CollectionConfig } from 'payload'

import { adminOnly, anyone } from '../access'

export const Sections: CollectionConfig = {
  slug: 'sections',
  admin: {
    useAsTitle: 'title',
    group: 'Course',
    defaultColumns: ['title', 'slug', 'sort'],
  },
  access: {
    read: anyone,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'sort', type: 'number', defaultValue: 0 },
  ],
}
