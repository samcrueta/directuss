import React from 'react'

export function BeforeLogin() {
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 16,
        padding: '20px 22px',
        marginBottom: 24,
        background:
          'linear-gradient(135deg, var(--theme-elevation-50), var(--theme-elevation-100))',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-600)',
        }}
      >
        Lumina Academy · Level 7
      </p>
      <h2 style={{ margin: '8px 0 6px', fontSize: 24, lineHeight: 1.2 }}>
        Advanced Payload
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: 420,
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--theme-elevation-700)',
        }}
      >
        This is the CMS behind the UI/UX component lab. Sign in to moderate the
        showcase, feature a learner submission, or edit a lesson.
      </p>
    </div>
  )
}
