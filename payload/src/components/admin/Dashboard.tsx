import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 14,
  padding: 18,
  background: 'var(--theme-elevation-0)',
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) {
  return (
    <div style={cardStyle}>
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-500)',
        }}
      >
        {label}
      </p>
      <p style={{ margin: '8px 0 4px', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--theme-elevation-600)' }}>{note}</p>
    </div>
  )
}

export async function Dashboard({
  initPageResult,
  params,
  searchParams,
  user,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const payload = req.payload

  const [total, published, drafts, recent] = await Promise.all([
    payload.count({ collection: 'components', overrideAccess: true }),
    payload.count({
      collection: 'components',
      where: { status: { equals: 'published' } },
      overrideAccess: true,
    }),
    payload.count({
      collection: 'components',
      where: { status: { equals: 'draft' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'components',
      sort: '-updatedAt',
      limit: 6,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={user}
      viewType="dashboard"
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div style={{ padding: '28px 0 48px', maxWidth: 1080 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--theme-elevation-500)',
            }}
          >
            Lumina Academy · Level 7
          </p>
          <h1 style={{ margin: '8px 0 6px', fontSize: 34, lineHeight: 1.1 }}>
            Advanced Payload
          </h1>
          <p
            style={{
              margin: '0 0 28px',
              maxWidth: 620,
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--theme-elevation-700)',
            }}
          >
            The course content, learner versions, and the public showcase all live
            here. Publish from the lab, then feature the strongest submissions.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              marginBottom: 28,
            }}
          >
            <Stat label="All versions" value={total.totalDocs} note="Every saved lab version" />
            <Stat label="Published" value={published.totalDocs} note="Visible in the showcase" />
            <Stat label="Drafts" value={drafts.totalDocs} note="Saved but not public" />
            <Stat label="Lessons" value={17} note="Seventeen UI/UX lessons" />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
            <a
              href="/admin/collections/components"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--theme-success-500)',
                color: '#07130d',
                borderRadius: 9,
                padding: '10px 15px',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Moderate components
            </a>
            <a
              href="/admin/collections/lessons"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--theme-elevation-200)',
                color: 'var(--theme-elevation-900)',
                borderRadius: 9,
                padding: '10px 15px',
                fontSize: 13,
                fontWeight: 600,
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--theme-elevation-200)',
                color: 'var(--theme-elevation-900)',
                borderRadius: 9,
                padding: '10px 15px',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Open public showcase ↗
            </a>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16 }}>Recently saved</h2>
              <a
                href="/admin/collections/components"
                style={{ fontSize: 12, color: 'var(--theme-elevation-600)' }}
              >
                View all
              </a>
            </div>
            {recent.docs.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-600)' }}>
                No learner versions yet. Open the course lab to save the first one.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {recent.docs.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/admin/collections/components/${doc.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 9,
                      background: 'var(--theme-elevation-50)',
                      color: 'var(--theme-elevation-900)',
                      textDecoration: 'none',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{doc.name}</span>
                    <span style={{ color: 'var(--theme-elevation-500)' }}>
                      {doc.kind} · {doc.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
