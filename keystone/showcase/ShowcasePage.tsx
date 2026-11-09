import Head from 'next/head'
import React, { useEffect, useState } from 'react'

import { EmbedPage } from './EmbedPage'
import { ShowcaseGallery } from './ShowcaseGallery'
import { ShowcaseShell } from './ShowcaseShell'
import { showcaseCss } from './styles'
import type { ShowcaseItem } from './types'

const SHOWCASE_QUERY = `
  query KeystoneShowcase {
    components(
      where: {
        status: { equals: published }
        surface: { equals: public }
      }
    ) {
      id
      name
      description
      kind
      content
      tokens
      html
      css
      js
      lessonSlug
      featured
      publishedAt
    }
    showcaseSettings(take: 1) {
      title
      intro
      ctaLabel
      ctaHref
    }
  }
`

type Settings = {
  title?: string | null
  intro?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

type Mode = 'showcase' | 'embedded' | 'preview'

export function ShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('showcase')
  const [modeReady, setModeReady] = useState(false)

  useEffect(() => {
    document.documentElement.lang = 'en'
    const hash = window.location.hash.replace(/^#/, '')
    const params = new URLSearchParams(window.location.search)
    if (hash === 'preview' || params.get('preview') === '1') setMode('preview')
    else if (hash === 'embed' || params.get('embed') === '1') setMode('embedded')
    setModeReady(true)
  }, [])

  useEffect(() => {
    if (!modeReady || mode === 'preview') return undefined
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: SHOWCASE_QUERY }),
        })
        const payload = await response.json()
        if (!response.ok || payload.errors?.length) {
          throw new Error(payload.errors?.[0]?.message || 'Could not load the showcase.')
        }
        if (cancelled) return
        const nextItems = (payload.data?.components || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          kind: item.kind,
          content: item.content || {},
          tokens: item.tokens || {},
          html: item.html || '',
          css: item.css || '',
          js: item.js || '',
          lessonSlug: item.lessonSlug,
          featured: Boolean(item.featured),
          publishedAt: item.publishedAt || null,
        }))
        nextItems.sort((a: ShowcaseItem, b: ShowcaseItem) =>
          String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))
        )
        setItems(nextItems)
        setSettings(payload.data?.showcaseSettings?.[0] || null)
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load the showcase.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [modeReady, mode])

  return (
    <>
      <Head>
        <title>Advanced KeystoneJS Showcase</title>
        <meta
          name="description"
          content="UI/UX components built by learners in the Advanced KeystoneJS course, stored and rendered by Keystone."
        />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: showcaseCss }} />
      {!modeReady ? (
        <main className="sc-showcase sc-showcase-loading">
          <p>Starting the Keystone renderer…</p>
        </main>
      ) : mode === 'preview' ? (
        <main className="sc-showcase">
          <EmbedPage />
        </main>
      ) : (
        <ShowcaseShell embedded={mode === 'embedded'}>
          {loading ? (
            <section className="sc-showcase-loading">
              <p>Loading the Keystone showcase…</p>
            </section>
          ) : error ? (
            <section className="sc-showcase-error">
              <h1>The showcase is unavailable</h1>
              <p>{error}</p>
            </section>
          ) : (
            <ShowcaseGallery
              items={items}
              title={settings?.title || 'The Level 7 Showcase'}
              intro={
                settings?.intro ||
                'Components built by learners in the Advanced KeystoneJS course.'
              }
              ctaLabel={settings?.ctaLabel || undefined}
              ctaHref={settings?.ctaHref || undefined}
              embedded={mode === 'embedded'}
            />
          )}
        </ShowcaseShell>
      )}
    </>
  )
}
