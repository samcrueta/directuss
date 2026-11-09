import { list } from '@keystone-6/core'
import {
  checkbox,
  integer,
  json,
  password,
  relationship,
  select,
  text,
  timestamp,
} from '@keystone-6/core/fields'

import {
  adminFieldWrite,
  adminListAccess,
  publishedComponentFilter,
  publishedLessonFilter,
  publicListAccess,
  staffFieldRead,
  staffOnly,
} from './access'

const HEX = /^#[0-9a-f]{6}$/i
const LINK_KEYS = new Set(['ctaHref', 'primaryHref', 'secondaryHref', 'href'])
const MAX_HTML = 80_000
const MAX_CSS = 60_000
const MAX_JS = 40_000

function isValidLink(value: string) {
  return (
    value === '' ||
    value.startsWith('#') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('?') ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value)
  )
}

function findInvalidLink(value: unknown, path = 'content'): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const error = findInvalidLink(value[index], `${path}[${index}]`)
      if (error) return error
    }
    return null
  }
  if (!value || typeof value !== 'object') return null

  for (const [key, child] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return `${path} contains a reserved key`
    }
    if (LINK_KEYS.has(key)) {
      if (typeof child !== 'string' || !isValidLink(child.trim())) {
        return `${path}.${key} must be a relative or http(s) link`
      }
      continue
    }
    const error = findInvalidLink(child, `${path}.${key}`)
    if (error) return error
  }
  return null
}

function findInvalidToken(tokens: unknown): string | null {
  if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) {
    return 'Design tokens must be an object'
  }
  const record = tokens as Record<string, unknown>
  for (const key of ['accent', 'background', 'foreground', 'muted']) {
    if (record[key] != null && record[key] !== '') {
      if (typeof record[key] !== 'string' || !HEX.test(record[key] as string)) {
        return `${key} must be a six-digit hex color`
      }
    }
  }
  return null
}

const componentHooks = {
  resolveInput: async ({ resolvedData, item, operation }: any) => {
    const status = resolvedData.status ?? item?.status ?? 'draft'
    if (status === 'published') {
      if (!resolvedData.publishedAt && !item?.publishedAt) {
        resolvedData.publishedAt = new Date()
      }
    } else {
      resolvedData.publishedAt = null
    }
    if (operation === 'update') {
      resolvedData.updatedAt = new Date()
    }
    return resolvedData
  },
  validateInput: async ({ resolvedData, item, addValidationError }: any) => {
    const name = String(resolvedData.name ?? item?.name ?? '').trim()
    const description = String(resolvedData.description ?? item?.description ?? '')
    const kind = String(resolvedData.kind ?? item?.kind ?? '')
    const lessonSlug = String(resolvedData.lessonSlug ?? item?.lessonSlug ?? '')
    const surface = resolvedData.surface ?? item?.surface ?? 'public'
    const status = resolvedData.status ?? item?.status ?? 'draft'
    const content = resolvedData.content ?? item?.content
    const tokens = resolvedData.tokens ?? item?.tokens
    const html = resolvedData.html ?? item?.html
    const css = resolvedData.css ?? item?.css
    const js = resolvedData.js ?? item?.js

    if (!name) addValidationError('A component name is required.')
    if (name.length > 90) addValidationError('Name must be 90 characters or fewer.')
    if (description.length > 500) {
      addValidationError('Description must be 500 characters or fewer.')
    }
    if (!kind) addValidationError('A component kind is required.')
    if (!lessonSlug) addValidationError('A lesson slug is required.')
    if (status === 'published' && surface === 'admin') {
      addValidationError('Admin-surface components cannot be published.')
    }
    if (content != null) {
      if (typeof content !== 'object' || Array.isArray(content)) {
        addValidationError('Component content must be an object.')
      } else {
        const linkError = findInvalidLink(content)
        if (linkError) addValidationError(linkError)
        try {
          if (JSON.stringify(content).length > 60_000) {
            addValidationError('Component content is too large.')
          }
        } catch {
          addValidationError('Component content must be valid JSON.')
        }
      }
    }
    if (tokens != null) {
      const tokenError = findInvalidToken(tokens)
      if (tokenError) addValidationError(tokenError)
    }
    if (html != null && typeof html !== 'string') {
      addValidationError('Component HTML must be a string.')
    }
    if (css != null && typeof css !== 'string') {
      addValidationError('Component CSS must be a string.')
    }
    if (js != null && typeof js !== 'string') {
      addValidationError('Component JavaScript must be a string.')
    }
    if (typeof html === 'string' && html.length > MAX_HTML) {
      addValidationError('Component HTML is too large.')
    }
    if (typeof css === 'string' && css.length > MAX_CSS) {
      addValidationError('Component CSS is too large.')
    }
    if (typeof js === 'string' && js.length > MAX_JS) {
      addValidationError('Component JavaScript is too large.')
    }
    if (status === 'published' && surface === 'public') {
      const hasHtml = typeof html === 'string' && html.trim().length > 0
      const hasLegacyContent =
        content != null &&
        typeof content === 'object' &&
        !Array.isArray(content) &&
        Object.keys(content).length > 0
      if (!hasHtml && !hasLegacyContent) {
        addValidationError('A published component needs HTML or legacy content.')
      }
    }
  },
  afterOperation: async ({ operation, item, context }: any) => {
    if (operation !== 'create' && operation !== 'update') return
    if (item?.status !== 'published' || item?.surface !== 'public') return
    if (!item.ownerSession || !item.lessonSlug) return

    const others = await context.sudo().query.Component.findMany({
      where: {
        ownerSession: { equals: item.ownerSession },
        lessonSlug: { equals: item.lessonSlug },
        status: { equals: 'published' },
      },
    })

    for (const other of others) {
      if (other.id === item.id) continue
      await context.sudo().query.Component.updateOne({
        where: { id: other.id },
        data: { status: 'draft', publishedAt: null },
      })
    }
  },
}

export const lists = {
  User: list({
    access: adminListAccess,
    ui: {
      label: 'Users',
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      password: password(),
      role: select({
        type: 'enum',
        defaultValue: 'editor',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
        ],
      }),
    },
  }),

  Section: list({
    access: publicListAccess,
    ui: {
      label: 'Sections',
    },
    fields: {
      slug: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      title: text({ validation: { isRequired: true } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      sort: integer({ defaultValue: 0 }),
      lessons: relationship({ ref: 'Lesson.section', many: true }),
    },
  }),

  Lesson: list({
    access: {
      ...publicListAccess,
      filter: { query: publishedLessonFilter },
    },
    ui: {
      label: 'Lessons',
    },
    fields: {
      section: relationship({ ref: 'Section.lessons', many: false }),
      slug: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      title: text({ validation: { isRequired: true } }),
      sort: integer({ defaultValue: 0 }),
      track: select({
        type: 'enum',
        defaultValue: 'foundations',
        options: [
          { label: 'Component Foundations', value: 'foundations' },
          { label: 'Keystone Components', value: 'keystone' },
          { label: 'Ship & Showcase', value: 'ship' },
        ],
      }),
      outcome: text({ ui: { displayMode: 'textarea' }, validation: { isRequired: true } }),
      mentalModel: json(),
      lab: json(),
      takeaway: text({ ui: { displayMode: 'textarea' } }),
      knowledgeCheck: json(),
      deepDive: json(),
      published: checkbox({ defaultValue: true }),
      components: relationship({ ref: 'Component.lesson', many: true }),
    },
  }),

  Component: list({
    access: {
      ...publicListAccess,
      filter: { query: publishedComponentFilter },
    },
    ui: {
      label: 'Components',
    },
    hooks: componentHooks,
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      lesson: relationship({ ref: 'Lesson.components', many: false }),
      lessonSlug: text({ isIndexed: true, validation: { isRequired: true } }),
      ownerSession: text({
        isIndexed: true,
        access: {
          read: staffFieldRead,
          create: staffFieldRead,
          update: staffFieldRead,
        },
        ui: {
          description: 'Browser session that created this component. Not shown publicly.',
        },
      }),
      surface: select({
        type: 'enum',
        defaultValue: 'public',
        options: [
          { label: 'Public showcase', value: 'public' },
          { label: 'Admin lab only', value: 'admin' },
        ],
      }),
      kind: text({ isIndexed: true, validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        defaultValue: 'draft',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      featured: checkbox({
        defaultValue: false,
        access: {
          create: adminFieldWrite,
          update: adminFieldWrite,
        },
      }),
      publishedAt: timestamp({
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        validation: { isRequired: true },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      updatedAt: timestamp({
        defaultValue: { kind: 'now' },
        validation: { isRequired: true },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      html: text({
        ui: {
          displayMode: 'textarea',
          description: 'HTML body for component labs. Legacy builder rows use content instead.',
        },
      }),
      css: text({
        ui: {
          displayMode: 'textarea',
          description: 'CSS for component labs. Scoped to the sandboxed preview document.',
        },
      }),
      js: text({
        ui: {
          displayMode: 'textarea',
          description: 'JavaScript for component labs. Runs in a sandboxed iframe.',
        },
      }),
      content: json(),
      tokens: json(),
    },
  }),

  ComponentCatalog: list({
    access: publicListAccess,
    ui: {
      label: 'Component Catalog',
    },
    fields: {
      key: text({ isIndexed: 'unique', defaultValue: 'default' }),
      version: text({ defaultValue: '1' }),
      tokenFields: json(),
      tokenDefaults: json(),
      kinds: json(),
    },
  }),

  ShowcaseSettings: list({
    access: publicListAccess,
    graphql: {
      singular: 'ShowcaseSetting',
      plural: 'ShowcaseSettings',
    },
    ui: {
      label: 'Showcase Settings',
    },
    fields: {
      key: text({ isIndexed: 'unique', defaultValue: 'default' }),
      title: text({ defaultValue: 'The Level 7 Showcase' }),
      intro: text({ ui: { displayMode: 'textarea' } }),
      ctaLabel: text({ defaultValue: 'Build your own' }),
      ctaHref: text({ defaultValue: '/courses/keystonejs/advanced' }),
    },
  }),

  Token: list({
    access: {
      operation: {
        query: staffOnly,
        create: staffOnly,
        update: staffOnly,
        delete: staffOnly,
      },
    },
    ui: {
      label: 'Design Tokens',
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      value: json({
        ui: {
          views: './fields/color-token',
        },
      }),
      description: text(),
    },
  }),
}
