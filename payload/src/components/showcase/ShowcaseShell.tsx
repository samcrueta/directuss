import Link from 'next/link'
import React from 'react'

export function ShowcaseShell({ children }: { children: React.ReactNode }) {
  const courseUrl = `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/courses/payload-cms/advanced`

  return (
    <main className="sc-showcase">
      <header className="sc-showcase-header">
        <Link className="sc-showcase-brand" href="/showcase">
          <span className="sc-showcase-mark" />
          LUMINA · PAYLOAD
        </Link>
        <nav className="sc-showcase-nav" aria-label="Showcase">
          <Link href="/showcase">Showcase</Link>
          <a href={courseUrl}>Course</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      {children}

      <footer className="sc-showcase-footer">
        <span>Level 7 · UI/UX components, stored and rendered by Payload.</span>
        <span>
          <a href={courseUrl}>Back to the course</a> ·{' '}
          <a href="/admin">Moderate submissions</a>
        </span>
      </footer>
    </main>
  )
}
