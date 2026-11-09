'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { renderDocument } from './renderDocument'
import type { ShowcaseItem } from './types'

const KIND_LABELS: Record<string, string> = {
  card: 'Card',
  button: 'Button',
  contactForm: 'Form',
  page: 'Page',
  pricing: 'Pricing',
  testimonial: 'Testimonial',
  hero: 'Hero',
  featureGrid: 'Features',
  cta: 'CTA',
  adminStatCard: 'Admin card',
  tokenField: 'Field',
}

function labelForKind(kind: string) {
  return KIND_LABELS[kind] || kind
}

function humanizeLesson(slug?: string) {
  if (!slug) return 'Level 7'
  return slug.replace(/-/g, ' ')
}

function detailHref(id: number | string, embed: boolean) {
  return `/showcase/${id}${embed ? '?embed=1' : ''}`
}

function ComponentFrame({
  item,
  compact = false,
}: {
  item: ShowcaseItem
  compact?: boolean
}) {
  return (
    <iframe
      className={`sc-showcase-frame ${compact ? 'sc-showcase-frame-card' : ''}`}
      title={`${item.name} preview`}
      srcDoc={renderDocument(item)}
      sandbox="allow-scripts"
      loading={compact ? 'lazy' : 'eager'}
      tabIndex={compact ? -1 : undefined}
    />
  )
}

function ShowcaseCard({ item, embed }: { item: ShowcaseItem; embed: boolean }) {
  return (
    <div className="sc-showcase-card">
      <div className="sc-showcase-preview" aria-hidden="true">
        <ComponentFrame item={item} compact />
      </div>
      <div className="sc-showcase-meta">
        <div className="sc-showcase-meta-top">
          <span className="sc-showcase-name">{item.name}</span>
          <span className="sc-showcase-kind">{labelForKind(item.kind)}</span>
        </div>
        {item.description ? <p className="sc-showcase-desc">{item.description}</p> : null}
        <span className="sc-showcase-foot">
          <span>{humanizeLesson(item.lessonSlug)}</span>
          {item.featured ? <span>· Featured</span> : null}
        </span>
      </div>
      <Link
        className="sc-showcase-hit"
        href={detailHref(item.id, embed)}
        aria-label={`Open ${item.name}`}
      />
    </div>
  )
}

function FeaturedCard({ item, embed }: { item: ShowcaseItem; embed: boolean }) {
  return (
    <div className="sc-showcase-card sc-showcase-featured-card">
      <div className="sc-showcase-preview" aria-hidden="true">
        <ComponentFrame item={item} compact />
      </div>
      <div className="sc-showcase-meta">
        <span className="sc-showcase-kind">Featured · {labelForKind(item.kind)}</span>
        <span className="sc-showcase-name">{item.name}</span>
        {item.description ? <p className="sc-showcase-desc">{item.description}</p> : null}
        <span className="sc-showcase-foot">
          <span>{humanizeLesson(item.lessonSlug)}</span>
          <span>· View component →</span>
        </span>
      </div>
      <Link
        className="sc-showcase-hit"
        href={detailHref(item.id, embed)}
        aria-label={`Open ${item.name}`}
      />
    </div>
  )
}

export function ShowcaseGallery({
  items,
  title,
  intro,
  ctaLabel,
  ctaHref,
  embed = false,
}: {
  items: ShowcaseItem[]
  title: string
  intro: string
  ctaLabel?: string
  ctaHref?: string
  embed?: boolean
}) {
  const [kind, setKind] = useState('all')
  const [lesson, setLesson] = useState('all')

  const kinds = useMemo(
    () => Array.from(new Set(items.map((item) => item.kind))).sort(),
    [items],
  )
  const lessons = useMemo(
    () => Array.from(new Set(items.map((item) => item.lessonSlug).filter(Boolean) as string[])).sort(),
    [items],
  )

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (kind === 'all' || item.kind === kind) &&
          (lesson === 'all' || item.lessonSlug === lesson),
      ),
    [items, kind, lesson],
  )

  const featured = useMemo(() => {
    const pinned = items.filter((item) => item.featured)
    return (pinned.length ? pinned : items).slice(0, 2)
  }, [items])

  const showFeatured = kind === 'all' && lesson === 'all' && featured.length > 0

  return (
    <>
      <section className="sc-showcase-hero">
        <p className="sc-showcase-kicker">The Level 7 showcase</p>
        <h1 className="sc-showcase-title">{title}</h1>
        <p className="sc-showcase-intro">{intro}</p>
        <div className="sc-showcase-stats">
          <span className="sc-showcase-pill">{items.length} published</span>
          <span className="sc-showcase-pill">{kinds.length} component kinds</span>
          <span className="sc-showcase-pill">Rendered by Payload</span>
          {ctaLabel && ctaHref ? (
            <a
              className="sc-showcase-pill"
              href={ctaHref}
              target={embed ? '_top' : undefined}
              rel={embed ? 'noreferrer' : undefined}
            >
              {ctaLabel} →
            </a>
          ) : null}
        </div>
      </section>

      {showFeatured ? (
        <section className="sc-showcase-featured" aria-labelledby="featured-heading">
          <div className="sc-showcase-section-head">
            <h2 id="featured-heading">Featured work</h2>
            <p>Pinned by the course team.</p>
          </div>
          <div className="sc-showcase-grid sc-showcase-grid-featured">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} embed={embed} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="gallery-heading">
        <div className="sc-showcase-section-head" style={{ paddingTop: 40 }}>
          <h2 id="gallery-heading">All submissions</h2>
          <p>{filtered.length} shown</p>
        </div>

        <div className="sc-showcase-filters" role="group" aria-label="Filter by kind">
          <button
            type="button"
            className="sc-filter"
            aria-pressed={kind === 'all'}
            onClick={() => setKind('all')}
          >
            All kinds
          </button>
          {kinds.map((item) => (
            <button
              key={item}
              type="button"
              className="sc-filter"
              aria-pressed={kind === item}
              onClick={() => setKind(item)}
            >
              {labelForKind(item)}
            </button>
          ))}
        </div>

        {lessons.length > 1 ? (
          <div className="sc-showcase-filters" role="group" aria-label="Filter by lesson">
            <button
              type="button"
              className="sc-filter"
              aria-pressed={lesson === 'all'}
              onClick={() => setLesson('all')}
            >
              All lessons
            </button>
            {lessons.map((item) => (
              <button
                key={item}
                type="button"
                className="sc-filter"
                aria-pressed={lesson === item}
                onClick={() => setLesson(item)}
              >
                {humanizeLesson(item)}
              </button>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="sc-showcase-empty">
            <p>No published components match this filter yet.</p>
          </div>
        ) : (
          <div className="sc-showcase-grid">
            {filtered.map((item) => (
              <ShowcaseCard key={item.id} item={item} embed={embed} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
