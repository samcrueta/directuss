import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { Heading } from '@keystar/ui/typography'
import React, { useEffect, useState } from 'react'

const DASHBOARD_QUERY = `
  query KeystoneDashboard {
    componentsCount
    published: componentsCount(where: { status: { equals: published } })
    drafts: componentsCount(where: { status: { equals: draft } })
    lessonsCount
  }
`

const cardStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-0)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 14,
  padding: 18,
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div style={cardStyle}>
      <p
        style={{
          color: 'var(--theme-elevation-500)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, margin: '8px 0 4px' }}>
        {value}
      </p>
      <p style={{ color: 'var(--theme-elevation-600)', fontSize: 12, margin: 0 }}>
        {note}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const [counts, setCounts] = useState({
    componentsCount: 0,
    published: 0,
    drafts: 0,
    lessonsCount: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: DASHBOARD_QUERY }),
    })
      .then((response) => response.json().then((payload) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (cancelled) return
        if (!response.ok || payload.errors?.length) {
          setError(payload.errors?.[0]?.message || 'Could not load dashboard counts.')
          return
        }
        setCounts({
          componentsCount: payload.data?.componentsCount || 0,
          published: payload.data?.published || 0,
          drafts: payload.data?.drafts || 0,
          lessonsCount: payload.data?.lessonsCount || 0,
        })
      })
      .catch(() => {
        if (!cancelled) setError('Could not load dashboard counts.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageContainer header={<Heading type="h3">Advanced KeystoneJS</Heading>}>
      <div style={{ maxWidth: 1080, padding: '28px 0 48px' }}>
        <p
          style={{
            color: 'var(--theme-elevation-500)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          Lumina Academy · Level 7
        </p>
        <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: '8px 0 6px' }}>
          Course dashboard
        </h1>
        <p
          style={{
            color: 'var(--theme-elevation-700)',
            fontSize: 14,
            lineHeight: 1.65,
            margin: '0 0 28px',
            maxWidth: 680,
          }}
        >
          The lessons, learner versions, and the public showcase all live here. Publish
          from the lab, then feature the strongest submissions.
        </p>

        {error ? (
          <p style={{ color: 'var(--theme-danger-500)', fontSize: 13 }}>{error}</p>
        ) : null}

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            marginBottom: 28,
          }}
        >
          <Stat
            label="All versions"
            value={counts.componentsCount}
            note="Every saved lab version"
          />
          <Stat
            label="Published"
            value={counts.published}
            note="Visible in the showcase"
          />
          <Stat label="Drafts" value={counts.drafts} note="Saved but not public" />
          <Stat
            label="Lessons"
            value={counts.lessonsCount}
            note="Seventeen UI/UX lessons"
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <a
            href="/components"
            style={{
              background: 'var(--theme-success-500)',
              borderRadius: 9,
              color: '#07130d',
              fontSize: 13,
              fontWeight: 700,
              padding: '10px 15px',
              textDecoration: 'none',
            }}
          >
            Moderate components
          </a>
          <a
            href="/lessons"
            style={{
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 9,
              color: 'var(--theme-elevation-900)',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 15px',
              textDecoration: 'none',
            }}
          >
            Edit lessons
          </a>
          <a
            href="/showcase"
            target="_blank"
            rel="noreferrer"
            style={{
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 9,
              color: 'var(--theme-elevation-900)',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 15px',
              textDecoration: 'none',
            }}
          >
            Open public showcase ↗
          </a>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>Course surfaces</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/showcase" style={{ color: 'var(--theme-elevation-700)', fontSize: 13 }}>
              Public showcase → /showcase
            </a>
            <a href="/showcase#preview" style={{ color: 'var(--theme-elevation-700)', fontSize: 13 }}>
              Builder preview → /showcase#preview
            </a>
            <a href="/tokens" style={{ color: 'var(--theme-elevation-700)', fontSize: 13 }}>
              Custom color-token field → /tokens
            </a>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
