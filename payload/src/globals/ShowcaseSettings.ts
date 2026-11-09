import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '../access'

export const ShowcaseSettings: GlobalConfig = {
  slug: 'showcase-settings',
  label: 'Showcase Settings',
  admin: {
    group: 'Showcase',
  },
  access: {
    read: anyone,
    update: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'The Level 7 Showcase',
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'Components built by learners in the Advanced Payload course. Every entry below is stored, published, and rendered from Payload.',
      required: true,
    },
    {
      name: 'featured',
      type: 'relationship',
      relationTo: 'components',
      admin: { description: 'Optional hero submission pinned above the gallery.' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Build your own',
    },
    {
      name: 'ctaHref',
      type: 'text',
      defaultValue: '/admin',
    },
  ],
}
