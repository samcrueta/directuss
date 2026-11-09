import express, { type Request, type Response } from 'express'

const MAX_NAME = 90
const MAX_DESCRIPTION = 500
const MAX_CONTENT = 60_000
const MAX_HTML = 80_000
const MAX_CSS = 60_000
const MAX_JS = 40_000
const HEX = /^#[0-9a-f]{6}$/i
const SESSION_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/
const LESSON_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/
const LINK_KEYS = new Set(['ctaHref', 'primaryHref', 'secondaryHref', 'href'])

class LuminaError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function errorResponse(error: unknown, res: Response) {
  const status = error instanceof LuminaError ? error.status : 500
  const message =
    error instanceof LuminaError
      ? error.message
      : 'The Keystone lab could not complete that request.'
  if (!(error instanceof LuminaError)) console.error('[lumina]', error)
  res.status(status).json({ error: message })
}

function requireSecret(request: Request) {
  const expected = process.env.LUMINA_SECRET
  if (!expected) throw new LuminaError('The Keystone Lumina secret is not configured.', 503)
  if (request.header('x-lumina-secret') !== expected) {
    throw new LuminaError('Unauthorized lab request.', 401)
  }
}

function requireSession(request: Request) {
  const session = request.header('x-lumina-session')
  if (!session || !SESSION_PATTERN.test(session)) {
    throw new LuminaError('A valid lab session is required.', 400)
  }
  return session
}

function requireId(value: string | string[] | undefined) {
  const id = Array.isArray(value) ? value[0] : value
  if (!id || !ID_PATTERN.test(id)) {
    throw new LuminaError('Invalid component id.', 400)
  }
  return id
}

function requireLessonSlug(value: unknown) {
  const slug = String(value || '')
  if (!LESSON_SLUG_PATTERN.test(slug)) {
    throw new LuminaError('Invalid lesson slug.', 400)
  }
  return slug
}

function safeLink(value: unknown, key: string) {
  if (typeof value !== 'string') throw new LuminaError(`${key} must be a link.`)
  const link = value.trim()
  if (!link) return ''
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('./') ||
    link.startsWith('../') ||
    link.startsWith('?') ||
    /^https?:\/\//i.test(link) ||
    /^mailto:/i.test(link) ||
    /^tel:/i.test(link)
  ) {
    return link
  }
  throw new LuminaError(`${key} must be a relative or http(s) link.`)
}

function sanitizeContent(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new LuminaError('Component content must be an object.')
  }

  const walk = (entry: unknown, path: string): unknown => {
    if (Array.isArray(entry)) {
      return entry.map((item, index) => walk(item, `${path}[${index}]`))
    }
    if (!entry || typeof entry !== 'object') return entry

    const next: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(entry)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new LuminaError(`${path} contains a reserved key.`)
      }
      next[key] = LINK_KEYS.has(key)
        ? safeLink(child, `${path}.${key}`)
        : walk(child, `${path}.${key}`)
    }
    return next
  }

  const normalized = walk(value, 'content')
  if (JSON.stringify(normalized).length > MAX_CONTENT) {
    throw new LuminaError('Component content is too large.')
  }
  return normalized
}

function sanitizeTokens(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new LuminaError('Design tokens must be an object.')
  }
  const record = value as Record<string, unknown>
  const result: Record<string, unknown> = {
    theme: record.theme === 'dark' ? 'dark' : 'light',
    radius: Math.min(32, Math.max(0, Math.round(Number(record.radius) || 14))),
    spacing: Math.min(48, Math.max(8, Math.round(Number(record.spacing) || 24))),
    fontScale: Math.min(
      1.4,
      Math.max(0.8, Math.round((Number(record.fontScale) || 1) * 100) / 100)
    ),
    shadow:
      record.shadow === 'none' || record.shadow === 'strong'
        ? record.shadow
        : 'soft',
  }

  for (const key of ['accent', 'background', 'foreground', 'muted']) {
    const raw = record[key]
    if (raw == null || raw === '') continue
    if (typeof raw !== 'string' || !HEX.test(raw)) {
      throw new LuminaError(`${key} must be a six-digit hex color.`)
    }
    result[key] = raw.toLowerCase()
  }

  return result
}

function sanitizeCode(input: any) {
  if (input?.html != null && typeof input.html !== 'string') {
    throw new LuminaError('Component HTML must be a string.')
  }
  if (input?.css != null && typeof input.css !== 'string') {
    throw new LuminaError('Component CSS must be a string.')
  }
  if (input?.js != null && typeof input.js !== 'string') {
    throw new LuminaError('Component JavaScript must be a string.')
  }

  const html = typeof input?.html === 'string' ? input.html : ''
  const css = typeof input?.css === 'string' ? input.css : ''
  const js = typeof input?.js === 'string' ? input.js : ''

  if (!html.trim()) throw new LuminaError('Component HTML is required.')
  if (html.length > MAX_HTML) {
    throw new LuminaError(`Component HTML must be ${MAX_HTML} characters or fewer.`)
  }
  if (css.length > MAX_CSS) {
    throw new LuminaError(`Component CSS must be ${MAX_CSS} characters or fewer.`)
  }
  if (js.length > MAX_JS) {
    throw new LuminaError(`Component JavaScript must be ${MAX_JS} characters or fewer.`)
  }

  return { html, css, js }
}

function validateInput(input: any, lesson: any) {
  const lab = typeof lesson.lab === 'string' ? JSON.parse(lesson.lab) : lesson.lab
  const isComponent = lab?.kind === 'component' && Boolean(lab.componentKind)
  const isBuilder = lab?.kind === 'builder' && Boolean(lab.builderKind)
  const isDataset = lab?.kind === 'dataset'
  if (!isComponent && !isBuilder && !isDataset) {
    throw new LuminaError('This lesson does not use a Keystone component lab.', 400)
  }

  const name = String(input?.name ?? '').trim()
  const description = String(input?.description ?? '').trim()
  if (!name) throw new LuminaError('A component name is required.')
  if (name.length > MAX_NAME) {
    throw new LuminaError(`Name must be ${MAX_NAME} characters or fewer.`)
  }
  if (description.length > MAX_DESCRIPTION) {
    throw new LuminaError(
      `Description must be ${MAX_DESCRIPTION} characters or fewer.`
    )
  }

  const expectedKind = isComponent
    ? lab.componentKind
    : isBuilder
      ? lab.builderKind
      : 'dataTable'
  const kind = String(input?.kind || expectedKind)
  if (kind !== expectedKind) {
    throw new LuminaError('This lab cannot save that component kind.')
  }

  const status = input?.status === 'published' ? 'published' : 'draft'
  const surface = lab.surface === 'admin' ? 'admin' : 'public'
  const publishable = lab.publishable === true && surface !== 'admin'
  if (status === 'published' && !publishable && !isDataset) {
    throw new LuminaError('This lab stays in draft mode.', 400)
  }

  return {
    name,
    description,
    kind,
    status,
    surface,
    code: isComponent ? sanitizeCode(input) : null,
    content: isComponent ? null : sanitizeContent(input?.content),
    tokens: isComponent ? null : sanitizeTokens(input?.tokens),
    lessonSlug: lesson.slug,
    lessonId: lesson.id,
  }
}

function metadata(component: any) {
  return {
    id: component.id,
    name: component.name,
    description: component.description || '',
    kind: component.kind,
    lessonSlug: component.lessonSlug,
    surface: component.surface,
    status: component.status,
    publishedAt: component.publishedAt || null,
    updatedAt: component.updatedAt || null,
    createdAt: component.createdAt || null,
  }
}

function serialize(component: any) {
  if (!component) return null
  return {
    ...metadata(component),
    html: component.html || '',
    css: component.css || '',
    js: component.js || '',
    content: component.content || {},
    tokens: component.tokens || {},
  }
}

async function loadLesson(sudo: any, slug: string) {
  const lesson = await sudo.query.Lesson.findOne({
    where: { slug },
    query: 'id slug lab',
  })
  if (!lesson) throw new LuminaError('Lesson not found.', 404)
  return lesson
}

const COMPONENT_FIELDS =
  'id name description kind lessonSlug ownerSession surface status featured publishedAt html css js content tokens updatedAt createdAt'

async function loadOwned(sudo: any, id: string, session: string) {
  const component = await sudo.query.Component.findOne({
    where: { id },
    query: COMPONENT_FIELDS,
  })
  if (!component || component.ownerSession !== session) {
    throw new LuminaError('Component not found.', 404)
  }
  return component
}

export function registerLuminaApi(app: any, commonContext: any) {
  const jsonBody = express.json({ limit: '512kb' })

  app.get('/robots.txt', (_request: Request, response: Response) => {
    response
      .type('text/plain')
      .send('User-agent: *\nAllow: /showcase\nDisallow: /\n')
  })

  app.get('/api/lumina/health', (_request: Request, response: Response) => {
    response.json({
      ok: true,
      service: 'keystone',
      version: '8.2.0',
      showcase: `${process.env.KEYSTONE_PUBLIC_URL || 'http://localhost:3003'}/showcase`,
    })
  })

  app.get('/api/lumina/charts', async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const [lessons, components] = await Promise.all([
        context.query.Lesson.findMany({
          query: 'track published',
        }),
        context.query.Component.findMany({
          query: 'kind status surface createdAt updatedAt content',
        }),
      ])
      response.json({
        data: {
          lessons,
          components,
          generatedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      errorResponse(error, response)
    }
  })

  app.get('/api/lumina/components', async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const session = requireSession(request)
      const lessonSlug = requireLessonSlug(request.query.lesson)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const items = await context.query.Component.findMany({
        where: {
          ownerSession: { equals: session },
          lessonSlug: { equals: lessonSlug },
        },
        take: 50,
        query: `${COMPONENT_FIELDS}`,
      })
      items.sort((a: any, b: any) =>
        String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
      )
      response.json({
        data: items.map((item: any) => ({
          ...metadata(item),
          content: item.content || {},
          tokens: item.tokens || {},
        })),
      })
    } catch (error) {
      errorResponse(error, response)
    }
  })

  app.post('/api/lumina/components', jsonBody, async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const session = requireSession(request)
      const input = request.body
      const lessonSlug = requireLessonSlug(input?.lessonSlug)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const lesson = await loadLesson(context, lessonSlug)
      const data = validateInput(input, lesson)

      const created = await context.query.Component.createOne({
        data: {
          name: data.name,
          description: data.description,
          lesson: { connect: { id: data.lessonId } },
          lessonSlug: data.lessonSlug,
          ownerSession: session,
          surface: data.surface,
          kind: data.kind,
          status: data.status,
          html: data.code?.html ?? '',
          css: data.code?.css ?? '',
          js: data.code?.js ?? '',
          content: data.content,
          tokens: data.tokens,
          publishedAt: data.status === 'published' ? new Date() : null,
        },
        query: COMPONENT_FIELDS,
      })
      response.status(201).json({ data: serialize(created) })
    } catch (error) {
      errorResponse(error, response)
    }
  })

  app.get('/api/lumina/components/:id', async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const session = requireSession(request)
      const id = requireId(request.params.id)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const component = await loadOwned(context, id, session)
      response.json({ data: serialize(component) })
    } catch (error) {
      errorResponse(error, response)
    }
  })

  app.patch('/api/lumina/components/:id', jsonBody, async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const session = requireSession(request)
      const id = requireId(request.params.id)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const component = await loadOwned(context, id, session)
      const lesson = await loadLesson(context, component.lessonSlug)
      const data = validateInput(request.body, lesson)

      const updated = await context.query.Component.updateOne({
        where: { id: component.id },
        data: {
          name: data.name,
          description: data.description,
          surface: data.surface,
          kind: data.kind,
          status: data.status,
          html: data.code?.html ?? '',
          css: data.code?.css ?? '',
          js: data.code?.js ?? '',
          content: data.content,
          tokens: data.tokens,
          publishedAt: data.status === 'published' ? new Date() : null,
        },
        query: COMPONENT_FIELDS,
      })
      response.json({ data: serialize(updated) })
    } catch (error) {
      errorResponse(error, response)
    }
  })

  app.delete('/api/lumina/components/:id', async (request: Request, response: Response) => {
    try {
      requireSecret(request)
      const session = requireSession(request)
      const id = requireId(request.params.id)
      const context = (await commonContext.withRequest(request, response)).sudo()
      const component = await loadOwned(context, id, session)
      await context.query.Component.deleteOne({ where: { id: component.id } })
      response.status(204).end()
    } catch (error) {
      errorResponse(error, response)
    }
  })
}
