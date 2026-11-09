import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '../access'

export const ComponentCatalog: GlobalConfig = {
  slug: 'component-catalog',
  label: 'Component Catalog',
  admin: {
    group: 'Course',
    description: 'The component kinds, field schemas, defaults, and tokens used by the Level 7 builder.',
  },
  access: {
    read: anyone,
    update: adminOnly,
  },
  fields: [
    {
      name: 'version',
      type: 'text',
      defaultValue: '1',
      admin: { readOnly: true },
    },
    {
      name: 'tokenFields',
      type: 'json',
      required: true,
      admin: { description: 'Field definitions for the design-token editor.' },
    },
    {
      name: 'tokenDefaults',
      type: 'json',
      required: true,
      admin: { description: 'Default design-token values.' },
    },
    {
      name: 'kinds',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        {
          name: 'surface',
          type: 'select',
          required: true,
          defaultValue: 'public',
          options: [
            { label: 'Public showcase', value: 'public' },
            { label: 'Admin lab only', value: 'admin' },
            { label: 'Internal block', value: 'internal' },
          ],
        },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text' },
        { name: 'hidden', type: 'checkbox', defaultValue: false },
        { name: 'order', type: 'number', defaultValue: 0 },
        {
          name: 'fields',
          type: 'json',
          required: true,
          admin: { description: 'Array of field definitions for the builder.' },
        },
        {
          name: 'defaults',
          type: 'json',
          required: true,
          admin: { description: 'Default content for a new component of this kind.' },
        },
        {
          name: 'defaultTokens',
          type: 'json',
          admin: { description: 'Optional token overrides for this kind.' },
        },
      ],
    },
  ],
}
