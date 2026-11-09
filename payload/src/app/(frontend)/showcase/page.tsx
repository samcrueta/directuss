import config from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { ShowcaseGallery } from '@/components/showcase/ShowcaseGallery'
import { ShowcaseShell } from '@/components/showcase/ShowcaseShell'
import type { ShowcaseItem } from '@/components/showcase/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Showcase · Advanced Payload',
  description: 'Published UI/UX components built by Level 7 learners.',
}

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const embedded = embed === '1'
  const payload = await getPayload({ config })

  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'components',
      where: {
        and: [{ status: { equals: 'published' } }, { surface: { equals: 'public' } }],
      },
      sort: '-publishedAt',
      limit: 60,
      depth: 0,
      overrideAccess: true,
    }),
    payload.findGlobal({ slug: 'showcase-settings', depth: 0, overrideAccess: true }),
  ])

  const items: ShowcaseItem[] = result.docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    description: doc.description || '',
    kind: doc.kind,
    content: (doc.content || {}) as Record<string, unknown>,
    tokens: (doc.tokens || {}) as ShowcaseItem['tokens'],
    html: doc.html || '',
    css: doc.css || '',
    js: doc.js || '',
    lessonSlug: doc.lessonSlug,
    featured: Boolean(doc.featured),
    publishedAt: doc.publishedAt || null,
  }))

  const gallery = (
    <ShowcaseGallery
      items={items}
      title={settings.title || 'The Level 7 Showcase'}
      intro={
        settings.intro ||
        'Components built by learners in the Advanced Payload course.'
      }
      ctaLabel={settings.ctaLabel || undefined}
      ctaHref={settings.ctaHref || undefined}
      embed={embedded}
    />
  )

  if (embedded) {
    return <main className="sc-showcase sc-showcase-embedded">{gallery}</main>
  }

  return <ShowcaseShell>{gallery}</ShowcaseShell>
}
