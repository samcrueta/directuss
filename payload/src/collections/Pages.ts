import type { CollectionConfig } from 'payload'

import { adminOnly, isStaff } from '../access'
import { CTABlock } from '../blocks/CTA'
import { FeatureGridBlock } from '../blocks/FeatureGrid'
import { HeroBlock } from '../blocks/Hero'
import { TestimonialBlock } from '../blocks/Testimonial'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Showcase',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => `/preview?id=${data.id}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 720 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 900 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 900 },
      ],
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    read: ({ req }) => (isStaff(req.user) ? true : { _status: { equals: 'published' } }),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'layout',
      type: 'blocks',
      minRows: 1,
      maxRows: 20,
      blocks: [HeroBlock, FeatureGridBlock, TestimonialBlock, CTABlock],
    },
  ],
}
