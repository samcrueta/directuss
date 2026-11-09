import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text', maxLength: 48 },
    { name: 'title', type: 'text', required: true, maxLength: 90 },
    { name: 'body', type: 'textarea', maxLength: 280 },
    { name: 'primaryLabel', type: 'text', maxLength: 40 },
    { name: 'primaryHref', type: 'text', maxLength: 200 },
    { name: 'secondaryLabel', type: 'text', maxLength: 40 },
    { name: 'secondaryHref', type: 'text', maxLength: 200 },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
    {
      name: 'art',
      type: 'select',
      defaultValue: 'gradient',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Grid', value: 'grid' },
      ],
    },
  ],
}
