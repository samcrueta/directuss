import type { CollectionAfterChangeHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import {
  adminFieldOnly,
  adminOnly,
  isStaff,
  publishedComponents,
  staffFieldOnly,
} from '../access'

const MAX_NAME = 90
const MAX_DESCRIPTION = 500
const MAX_CONTENT = 60_000
const MAX_CODE_FIELD = 100_000
const MAX_TOTAL_CODE = 300_000
const HEX = /^#[0-9a-f]{6}$/i

const validateComponent: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return data

  const name = String(data.name ?? '').trim()
  const description = String(data.description ?? '').trim()

  if (!name) throw new APIError('A component name is required.', 400)
  if (name.length > MAX_NAME) {
    throw new APIError(`Name must be ${MAX_NAME} characters or fewer.`, 400)
  }
  if (description.length > MAX_DESCRIPTION) {
    throw new APIError(`Description must be ${MAX_DESCRIPTION} characters or fewer.`, 400)
  }
  if (!data.kind || typeof data.kind !== 'string') {
    throw new APIError('A component kind is required.', 400)
  }
  if (!data.lessonSlug || typeof data.lessonSlug !== 'string') {
    throw new APIError('A lesson slug is required.', 400)
  }

  const content = data.content
  if (!content || typeof content !== 'object') {
    throw new APIError('Component content must be an object.', 400)
  }

  let serialized = ''
  try {
    serialized = JSON.stringify(content)
  } catch {
    throw new APIError('Component content must be valid JSON.', 400)
  }
  if (serialized.length > MAX_CONTENT) {
    throw new APIError('Component content is too large.', 400)
  }

  const html = typeof data.html === 'string' ? data.html : ''
  const css = typeof data.css === 'string' ? data.css : ''
  const js = typeof data.js === 'string' ? data.js : ''
  const hasCode = Boolean(html.trim() || css.trim() || js.trim())
  const hasLegacyContent = serialized !== '{}' && serialized !== '[]'

  if (!hasCode && !hasLegacyContent) {
    throw new APIError('Provide HTML/CSS/JS component code or kind-specific content.', 400)
  }
  if (hasCode && !html.trim()) {
    throw new APIError('HTML is required for HTML/CSS/JS components.', 400)
  }
  if (
    html.length > MAX_CODE_FIELD ||
    css.length > MAX_CODE_FIELD ||
    js.length > MAX_CODE_FIELD
  ) {
    throw new APIError('Each code pane must be 100 KB or smaller.', 400)
  }
  if (html.length + css.length + js.length > MAX_TOTAL_CODE) {
    throw new APIError('The component code is larger than 300 KB.', 400)
  }

  if (data.status === 'published' && data.surface === 'admin') {
    throw new APIError('Admin-surface components stay inside the lab and cannot be published.', 400)
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  if (data.status === 'draft') {
    data.publishedAt = null
  }

  return data
}

const unpublishPrevious: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (doc.status !== 'published' || doc.surface !== 'public') return doc
  if (operation === 'update' && previousDoc?.status === 'published') return doc
  if (!doc.ownerSession || !doc.lessonSlug) return doc

  const { docs } = await req.payload.find({
    collection: 'components',
    where: {
      and: [
        { id: { not_equals: doc.id } },
        { ownerSession: { equals: doc.ownerSession } },
        { lessonSlug: { equals: doc.lessonSlug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 0,
    limit: 50,
    overrideAccess: true,
  })

  await Promise.all(
    docs.map((item) =>
      req.payload.update({
        collection: 'components',
        id: item.id,
        data: { status: 'draft', publishedAt: null },
        overrideAccess: true,
      }),
    ),
  )

  return doc
}

export const Components: CollectionConfig = {
  slug: 'components',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'name',
    group: 'Showcase',
    defaultColumns: ['name', 'kind', 'lessonSlug', 'status', 'featured', 'updatedAt'],
    listSearchableFields: ['name', 'description', 'lessonSlug', 'ownerSession'],
  },
  access: {
    read: publishedComponents,
    create: ({ req }) => isStaff(req.user),
    update: ({ req }) => isStaff(req.user),
    delete: ({ req }) => isStaff(req.user),
  },
  hooks: {
    beforeValidate: [validateComponent],
    afterChange: [unpublishPrevious],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: MAX_NAME },
    { name: 'description', type: 'textarea', maxLength: MAX_DESCRIPTION },
    {
      name: 'html',
      type: 'textarea',
      maxLength: MAX_CODE_FIELD,
      admin: {
        rows: 14,
        description: 'The component markup. Rendered inside a sandboxed iframe.',
      },
    },
    {
      name: 'css',
      type: 'textarea',
      maxLength: MAX_CODE_FIELD,
      admin: {
        rows: 10,
        description: 'Component styles. Inline styles only; external resources are blocked.',
      },
    },
    {
      name: 'js',
      type: 'textarea',
      maxLength: MAX_CODE_FIELD,
      admin: {
        rows: 10,
        description: 'Component behavior. Runs inside the sandboxed iframe.',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      admin: { position: 'sidebar' },
    },
    {
      name: 'lessonSlug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ownerSession',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Browser session that created this version. Not shown publicly.',
      },
      access: {
        read: staffFieldOnly,
      },
    },
    {
      name: 'surface',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: [
        { label: 'Public showcase', value: 'public' },
        { label: 'Admin lab only', value: 'admin' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'kind',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured components appear first in the gallery.',
      },
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description:
          'Legacy kind-specific content. HTML/CSS/JS components store an empty object here.',
      },
    },
    {
      name: 'tokens',
      type: 'group',
      label: 'Design tokens',
      fields: [
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'light',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
        },
        {
          name: 'accent',
          type: 'text',
          defaultValue: '#4f46e5',
          validate: (value: string | null | undefined) =>
            !value || HEX.test(value) || 'Use a six-digit hex color.',
          admin: {
            components: {
              Field: '/components/admin/ColorField#ColorField',
            },
          },
        },
        {
          name: 'background',
          type: 'text',
          defaultValue: '#ffffff',
          validate: (value: string | null | undefined) =>
            !value || HEX.test(value) || 'Use a six-digit hex color.',
        },
        {
          name: 'foreground',
          type: 'text',
          defaultValue: '#0f172a',
          validate: (value: string | null | undefined) =>
            !value || HEX.test(value) || 'Use a six-digit hex color.',
        },
        {
          name: 'muted',
          type: 'text',
          defaultValue: '#64748b',
          validate: (value: string | null | undefined) =>
            !value || HEX.test(value) || 'Use a six-digit hex color.',
        },
        {
          name: 'radius',
          type: 'number',
          defaultValue: 14,
          min: 0,
          max: 32,
        },
        {
          name: 'spacing',
          type: 'number',
          defaultValue: 24,
          min: 8,
          max: 48,
        },
        {
          name: 'fontScale',
          type: 'number',
          defaultValue: 1,
          min: 0.8,
          max: 1.4,
        },
        {
          name: 'shadow',
          type: 'select',
          defaultValue: 'soft',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Soft', value: 'soft' },
            { label: 'Strong', value: 'strong' },
          ],
        },
      ],
    },
  ],
}
