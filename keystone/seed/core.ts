import fs from 'node:fs'
import path from 'node:path'

import { CATALOG_KINDS, SAMPLE_COMPONENTS, TOKEN_DEFAULTS, TOKEN_FIELDS } from './catalog'

const SEED_SESSION = '11111111-1111-4111-8111-111111111111'

function contentPath() {
  const candidates = [
    process.env.CONTENT_PATH,
    path.resolve(process.cwd(), '../frontend/content/keystone-advanced.json'),
    path.resolve(process.cwd(), 'frontend/content/keystone-advanced.json'),
  ].filter(Boolean) as string[]

  const found = candidates.find((candidate) => fs.existsSync(candidate))
  if (!found) throw new Error(`Could not find keystone-advanced.json. Tried:\n${candidates.join('\n')}`)
  return found
}

function loadContent() {
  return JSON.parse(fs.readFileSync(contentPath(), 'utf8'))
}

function env(name: string, fallback: string) {
  return process.env[name] || fallback
}

async function seedSection(sudo: any, section: any) {
  const data = {
    slug: section.slug,
    title: section.title,
    description: section.description,
    sort: 1,
  }
  const existing = await sudo.db.Section.findOne({ where: { slug: section.slug } })
  if (existing) {
    return sudo.db.Section.updateOne({ where: { id: existing.id }, data })
  }
  return sudo.db.Section.createOne({ data })
}

async function seedCatalog(sudo: any, content: any) {
  const catalog = content.catalog || {
    tokenFields: TOKEN_FIELDS,
    tokenDefaults: TOKEN_DEFAULTS,
    kinds: CATALOG_KINDS,
  }
  const data = {
    key: 'default',
    version: catalog.version || '1',
    tokenFields: catalog.tokenFields,
    tokenDefaults: catalog.tokenDefaults,
    kinds: catalog.kinds,
  }
  const existing = await sudo.db.ComponentCatalog.findOne({ where: { key: 'default' } })
  if (existing) {
    await sudo.db.ComponentCatalog.updateOne({ where: { id: existing.id }, data })
    return
  }
  await sudo.db.ComponentCatalog.createOne({ data })
}

async function seedSettings(sudo: any, content: any) {
  const existing = await sudo.db.ShowcaseSettings.findOne({ where: { key: 'default' } })
  if (existing) return

  const webOrigin = env('WEB_ORIGIN', 'http://localhost:3000')
  await sudo.db.ShowcaseSettings.createOne({
    data: {
      key: 'default',
      title: 'The Level 7 Showcase',
      intro:
        'Components built by learners in the Advanced KeystoneJS course. Every entry is stored in Keystone, published from the lab, and rendered by the Keystone showcase.',
      ctaLabel: 'Build your own',
      ctaHref: `${webOrigin}/courses/keystonejs/advanced`,
    },
  })
}

async function seedToken(sudo: any) {
  const existing = await sudo.db.Token.findMany({
    where: { name: { equals: 'Accent color' } },
    take: 1,
  })
  if (existing.length) return

  await sudo.db.Token.createOne({
    data: {
      name: 'Accent color',
      value: '#4f46e5',
      description: 'The primary action color used by every Level 7 component.',
    },
  })
}

async function seedLessons(sudo: any, content: any, sectionId: string) {
  const lessonIds = new Map<string, string>()

  for (const lesson of content.lessons) {
    const data = {
      section: { connect: { id: sectionId } },
      slug: lesson.slug,
      title: lesson.title,
      sort: lesson.sort,
      track: lesson.track,
      outcome: lesson.outcome,
      mentalModel: lesson.mental_model,
      lab: lesson.lab,
      takeaway: lesson.takeaway,
      knowledgeCheck: lesson.knowledge_check,
      deepDive: lesson.deep_dive,
      published: true,
    }

    const existing = await sudo.db.Lesson.findOne({ where: { slug: lesson.slug } })
    const saved = existing
      ? await sudo.db.Lesson.updateOne({ where: { id: existing.id }, data })
      : await sudo.db.Lesson.createOne({ data })

    lessonIds.set(lesson.slug, saved.id)
  }

  return lessonIds
}

function sampleCode(content: any, lessonSlug: string) {
  const lesson = content.lessons.find((item: any) => item.slug === lessonSlug)
  const solution = lesson?.lab?.solution
  if (!solution || typeof solution.html !== 'string') {
    throw new Error(`Sample ${lessonSlug} is missing an HTML solution.`)
  }
  return {
    html: solution.html,
    css: typeof solution.css === 'string' ? solution.css : '',
    js: typeof solution.js === 'string' ? solution.js : '',
  }
}

async function seedSamples(sudo: any, content: any, lessonIds: Map<string, string>) {
  let featuredSet = false

  for (const sample of SAMPLE_COMPONENTS) {
    const lessonId = lessonIds.get(sample.lessonSlug)
    const code = sampleCode(content, sample.lessonSlug)
    const existing = (
      await sudo.db.Component.findMany({
        where: {
          ownerSession: { equals: SEED_SESSION },
          name: { equals: sample.name },
        },
        take: 1,
      })
    )[0]
    const status = existing?.status || 'published'

    const data = {
      name: sample.name,
      description: sample.description,
      lesson: lessonId ? { connect: { id: lessonId } } : undefined,
      lessonSlug: sample.lessonSlug,
      ownerSession: SEED_SESSION,
      surface: 'public',
      kind: sample.kind,
      status,
      featured: existing ? Boolean(existing.featured) : Boolean(sample.featured || !featuredSet),
      publishedAt: status === 'published' ? existing?.publishedAt || new Date() : null,
      html: code.html,
      css: code.css,
      js: code.js,
      content: null,
      tokens: null,
    }

    const saved = existing
      ? await sudo.db.Component.updateOne({ where: { id: existing.id }, data })
      : await sudo.db.Component.createOne({ data })

    if (saved.featured) featuredSet = true
    console.log(`[keystone seed] component ${saved.name}`)
  }
}

export async function seedDatabase(context: any) {
  const sudo = context.sudo()
  const content = loadContent()

  if ((await sudo.db.User.count()) === 0) {
    await sudo.db.User.createOne({
      data: {
        name: 'Lumina Admin',
        email: env('KEYSTONE_ADMIN_EMAIL', 'admin@lumina.local'),
        password: env('KEYSTONE_ADMIN_PASSWORD', 'lumina-keystone-admin'),
        role: 'admin',
      },
    })
    console.log('[keystone seed] admin user created')
  }

  const section = await seedSection(sudo, content.section)
  await seedCatalog(sudo, content)
  await seedSettings(sudo, content)
  await seedToken(sudo)
  const lessonIds = await seedLessons(sudo, content, section.id)
  await seedSamples(sudo, content, lessonIds)

  console.log(`[keystone seed] ${content.lessons.length} lessons ready`)
}
