import React from 'react'

export function ShowcaseShell({
  children,
  embedded = false,
}: {
  children: React.ReactNode
  embedded?: boolean
}) {
  if (embedded) {
    return <main className="sc-showcase sc-showcase-embedded">{children}</main>
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const courseUrl = `http://${host}:3000/courses/keystonejs/advanced`

  return (
    <main className="sc-showcase">
      <header className="sc-showcase-header">
        <a className="sc-showcase-brand" href="/showcase">
          <span className="sc-showcase-mark" />
          LUMINA · KEYSTONE
        </a>
        <nav className="sc-showcase-nav" aria-label="Showcase">
          <a href="/showcase">Showcase</a>
          <a href={courseUrl}>Course</a>
          <a href="/signin">Admin</a>
        </nav>
      </header>

      {children}

      <footer className="sc-showcase-footer">
        <span>Level 7 · UI/UX components, stored and rendered by Keystone.</span>
        <span>
          <a href={courseUrl}>Back to the course</a> · <a href="/signin">Moderate submissions</a>
        </span>
      </footer>
    </main>
  )
}
