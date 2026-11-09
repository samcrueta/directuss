import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true, maxLength: 80 },
    { name: 'body', type: 'textarea', maxLength: 220 },
    { name: 'label', type: 'text', maxLength: 40 },
    { name: 'href', type: 'text', maxLength: 200 },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'accent',
      options: [
        { label: 'Accent', value: 'accent' },
        { label: 'Quiet', value: 'quiet' },
      ],
    },
  ],
}
