import type { Block } from 'payload'

export const TestimonialBlock: Block = {
  slug: 'testimonial',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  fields: [
    { name: 'quote', type: 'textarea', required: true, maxLength: 320 },
    { name: 'author', type: 'text', required: true, maxLength: 60 },
    { name: 'role', type: 'text', maxLength: 80 },
    { name: 'company', type: 'text', maxLength: 60 },
    { name: 'rating', type: 'number', min: 1, max: 5 },
  ],
}
