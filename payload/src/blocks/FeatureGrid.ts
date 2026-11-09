import type { Block } from 'payload'

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  labels: { singular: 'Feature grid', plural: 'Feature grids' },
  fields: [
    { name: 'heading', type: 'text', required: true, maxLength: 80 },
    { name: 'description', type: 'textarea', maxLength: 220 },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'icon', type: 'text', maxLength: 4 },
        { name: 'title', type: 'text', required: true, maxLength: 60 },
        { name: 'body', type: 'textarea', maxLength: 180 },
      ],
    },
  ],
}
