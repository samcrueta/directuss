import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  CATALOG_KINDS,
  SAMPLE_COMPONENTS,
  TOKEN_DEFAULTS,
  TOKEN_FIELDS,
} from './catalog'

const payload = await getPayload({ config })

const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@lumina.local'
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'lumina-payload-admin'
const SERVICE_EMAIL = process.env.PAYLOAD_SERVICE_EMAIL || 'service@lumina.local'
const SERVICE_PASSWORD = process.env.PAYLOAD_SERVICE_PASSWORD || 'lumina-payload-service'
const SERVICE_API_KEY =
  process.env.PAYLOAD_API_KEY || 'lumina-payload-service-key'

const SEED_SESSION = '11111111-1111-4111-8111-111111111111'

function contentPath() {
  const candidates = [
    process.env.CONTENT_PATH,
    '/content/payload-advanced.json',
    path.resolve(process.cwd(), '../frontend/content/payload-advanced.json'),
    path.resolve(process.cwd(), 'frontend/content/payload-advanced.json'),
  ].filter(Boolean) as string[]

  const found = candidates.find((candidate) => fs.existsSync(candidate))
  if (!found) {
    throw new Error(`Could not find payload-advanced.json. Tried:\n${candidates.join('\n')}`)
  }
  return found
}

const content = JSON.parse(fs.readFileSync(contentPath(), 'utf8'))

const solutionByLesson = new Map<string, { html?: string; css?: string; js?: string }>(
  (content.lessons as Array<{ slug: string; lab?: { solution?: Record<string, string> } }>).map(
    (lesson) => [lesson.slug, lesson.lab?.solution || {}],
  ),
)

async function findOne(collection: string, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0]
}

async function upsert(
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  const existing = await findOne(collection, where)
  if (existing) {
    await payload.update({
      collection: collection as never,
      id: (existing as { id: number | string }).id,
      data: data as never,
      overrideAccess: true,
    })
    return (existing as { id: number | string }).id
  }
  const created = await payload.create({
    collection: collection as never,
    data: data as never,
    overrideAccess: true,
  })
  return (created as { id: number | string }).id
}

console.log('Seeding Advanced Payload…')

await upsert(
  'users',
  { email: { equals: ADMIN_EMAIL } },
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: 'Lumina Admin',
    role: 'admin',
  },
)

await upsert(
  'users',
  { email: { equals: SERVICE_EMAIL } },
  {
    email: SERVICE_EMAIL,
    password: SERVICE_PASSWORD,
    name: 'Lumina Course Service',
    role: 'service',
    enableAPIKey: true,
    apiKey: SERVICE_API_KEY,
  },
)
console.log(`  users ready (${ADMIN_EMAIL}, ${SERVICE_EMAIL})`)

const sectionId = await upsert(
  'sections',
  { slug: { equals: content.section.slug } },
  {
    slug: content.section.slug,
    title: content.section.title,
    description: content.section.description,
    sort: 1,
  },
)
console.log(`  section ${content.section.slug} ready`)

const lessonIds = new Map<string, number | string>()

for (const lesson of content.lessons) {
  const id = await upsert(
    'lessons',
    { slug: { equals: lesson.slug } },
    {
      section: sectionId,
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
    },
  )
  lessonIds.set(lesson.slug, id)
}
console.log(`  ${content.lessons.length} lessons ready`)

const kinds = CATALOG_KINDS.map((kind, index) => ({
  ...kind,
  order: index,
}))

await payload.updateGlobal({
  slug: 'component-catalog',
  data: {
    version: '1',
    tokenFields: TOKEN_FIELDS,
    tokenDefaults: TOKEN_DEFAULTS,
    kinds,
  },
  overrideAccess: true,
})
console.log('  component catalog ready')

await payload.updateGlobal({
  slug: 'showcase-settings',
  data: {
    title: 'The Level 7 Showcase',
    intro:
      'Components built by learners in the Advanced Payload course. Every entry is stored in Payload as HTML, CSS, and JavaScript, published from the lab, and rendered in a locked-down sandbox.',
    ctaLabel: 'Build your own',
    ctaHref: 'http://localhost:3000/courses/payload-cms/advanced',
  },
  overrideAccess: true,
})
console.log('  showcase settings ready')

const sampleIds: Array<number | string> = []

for (const sample of SAMPLE_COMPONENTS) {
  const lessonId = lessonIds.get(sample.lessonSlug)
  const solution = solutionByLesson.get(sample.lessonSlug) || {}
  const id = await upsert(
    'components',
    {
      and: [
        { ownerSession: { equals: SEED_SESSION } },
        { name: { equals: sample.name } },
      ],
    },
    {
      name: sample.name,
      description: sample.description,
      lesson: lessonId,
      lessonSlug: sample.lessonSlug,
      ownerSession: SEED_SESSION,
      surface: 'public',
      kind: sample.kind,
      status: 'published',
      featured: sample.featured,
      publishedAt: new Date().toISOString(),
      content: {},
      html: solution.html || '',
      css: solution.css || '',
      js: solution.js || '',
    },
  )
  sampleIds.push(id)
}
console.log(`  ${sampleIds.length} sample components ready`)

await payload.updateGlobal({
  slug: 'showcase-settings',
  data: {
    featured: sampleIds[0] as number,
  },
  overrideAccess: true,
})

const homePage = {
  title: 'A page built from blocks',
  slug: 'showcase-demo',
  layout: [
    {
      blockType: 'hero',
      eyebrow: 'Payload pages',
      title: 'Compose, do not hard-code',
      body: 'This page is stored as blocks in Payload and rendered by the same React components as the showcase.',
      primaryLabel: 'Open the showcase',
      primaryHref: '/showcase',
      secondaryLabel: '',
      secondaryHref: '',
      alignment: 'left',
      art: 'grid',
    },
    {
      blockType: 'featureGrid',
      heading: 'Why blocks?',
      description: 'Structure lives in the CMS. Rendering stays predictable.',
      columns: '3',
      features: [
        { icon: '◇', title: 'Typed', body: 'Each block has its own schema.' },
        { icon: '◈', title: 'Composable', body: 'Editors decide the order.' },
        { icon: '◉', title: 'Previewable', body: 'Drafts render through the same components.' },
      ],
    },
    {
      blockType: 'cta',
      heading: 'Ready to build your own?',
      body: 'Open the Level 7 course and publish a component to the showcase.',
      label: 'Open the course',
      href: 'http://localhost:3000/courses/payload-cms/advanced',
      tone: 'accent',
    },
  ],
  _status: 'published',
}

await upsert('pages', { slug: { equals: homePage.slug } }, homePage)
console.log('  demo page ready')

console.log('\nSeed complete.')
console.log(`Admin: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/admin`)
console.log(`Showcase: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/showcase`)
console.log(`Service API key: ${SERVICE_API_KEY}`)
console.log(`Lessons: ${content.lessons.length}`)
process.exit(0)
