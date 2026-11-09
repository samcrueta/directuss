import type { CollectionConfig } from 'payload'

import { adminOnly, isStaff } from '../access'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  defaultSort: 'sort',
  admin: {
    useAsTitle: 'title',
    group: 'Course',
    defaultColumns: ['sort', 'title', 'track', 'published'],
  },
  access: {
    read: ({ req }) => (isStaff(req.user) ? true : { published: { equals: true } }),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
      index: true,
    },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'sort', type: 'number', required: true, defaultValue: 0 },
    {
      name: 'track',
      type: 'select',
      required: true,
      defaultValue: 'foundations',
      options: [
        { label: 'Component Foundations', value: 'foundations' },
        { label: 'Payload Components', value: 'payload' },
        { label: 'Ship & Showcase', value: 'ship' },
      ],
    },
    { name: 'outcome', type: 'textarea', required: true },
    {
      name: 'mentalModel',
      type: 'json',
      required: true,
      admin: { description: 'Array of three short mental-model statements.' },
    },
    {
      name: 'lab',
      type: 'json',
      required: true,
      admin: { description: 'Lab configuration consumed by the Lumina builder.' },
    },
    { name: 'takeaway', type: 'textarea', required: true },
    {
      name: 'knowledgeCheck',
      type: 'json',
      required: true,
      admin: { description: '{ question, options, answer, explanation }' },
    },
    {
      name: 'deepDive',
      type: 'json',
      required: true,
      admin: { description: 'Array of { title, body }.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
}
