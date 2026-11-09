import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { renderDocument } from '@/components/showcase/renderDocument'
import { ShowcaseShell } from '@/components/showcase/ShowcaseShell'

export const dynamic = 'force-dynamic'

type Params = { id: string }

async function loadComponent(id: string) {
  const payload = await getPayload({ config })
  const doc = await payload.findByID({
    collection: 'components',
    id,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  })
  if (!doc || doc.status !== 'published' || doc.surface !== 'public') return null
  return doc
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const doc = await loadComponent(id)
  if (!doc) return { title: 'Component not found · Advanced Payload' }
  return {
    title: `${doc.name} · Advanced Payload Showcase`,
    description: doc.description || 'A learner component from the Level 7 course.',
  }
}

export default async function ShowcaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<{ embed?: string }>
}) {
  const { id } = await params
  const { embed } = await searchParams
  const embedded = embed === '1'
  const doc = await loadComponent(id)
  if (!doc) notFound()

  const courseUrl = `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/courses/payload-cms/advanced`
  const lessonUrl = doc.lessonSlug ? `${courseUrl}/${doc.lessonSlug}` : courseUrl

  const article = (
    <article className="sc-showcase-detail">
      <Link className="sc-showcase-back" href={`/showcase${embedded ? '?embed=1' : ''}`}>
        ← Back to the showcase
      </Link>
      <p className="sc-showcase-kicker">Level 7 · {doc.kind}</p>
      <h1 className="sc-showcase-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
        {doc.name}
      </h1>
      {doc.description ? <p className="sc-showcase-intro">{doc.description}</p> : null}
      <div className="sc-showcase-detail-meta">
        <span>Published {doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString() : 'recently'}</span>
        {doc.featured ? <span>Curated feature</span> : null}
        <span>{doc.kind}</span>
      </div>
      <div className="sc-showcase-detail-frame">
        <iframe
          className="sc-showcase-frame sc-showcase-frame-detail"
          title={`${doc.name} preview`}
          srcDoc={renderDocument({
            html: typeof doc.html === 'string' ? doc.html : '',
            css: typeof doc.css === 'string' ? doc.css : '',
            js: typeof doc.js === 'string' ? doc.js : '',
          })}
          sandbox="allow-scripts"
        />
      </div>
      <p style={{ color: 'var(--sc-ui-muted)', fontSize: 13, marginTop: 22 }}>
        Built in{' '}
        <a
          href={lessonUrl}
          target={embedded ? '_top' : undefined}
          rel={embedded ? 'noreferrer' : undefined}
        >
          {doc.lessonSlug ? doc.lessonSlug.replace(/-/g, ' ') : 'the Level 7 course'}
        </a>
        .
        Every line above is stored in Payload and rendered inside a CSP-locked,
        sandboxed iframe.
      </p>
    </article>
  )

  if (embedded) {
    return <main className="sc-showcase sc-showcase-embedded">{article}</main>
  }

  return <ShowcaseShell>{article}</ShowcaseShell>
}
