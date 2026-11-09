import Link from 'next/link'
import React from 'react'

import { ShowcaseShell } from '@/components/showcase/ShowcaseShell'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const courseUrl = `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/courses/payload-cms/advanced`

  return (
    <ShowcaseShell>
      <section className="sc-landing">
        <div className="sc-landing-inner">
          <p className="sc-showcase-kicker">Lumina Academy · Level 7</p>
          <h1>Advanced Payload</h1>
          <p>
            A component platform, not a blank page. The twelve lessons in the course
            use Payload to model lessons, tokens, blocks, drafts, and learner
            submissions. This app renders the public showcase from the same data.
          </p>
          <div className="sc-landing-actions">
            <Link className="sc-landing-card" href="/showcase">
              <strong>Open the showcase ↗</strong>
              <span>Published components from the Level 7 labs.</span>
            </Link>
            <Link className="sc-landing-card" href="/admin">
              <strong>Payload admin</strong>
              <span>Lessons, components, featured entries, and moderation.</span>
            </Link>
            <a className="sc-landing-card" href={courseUrl}>
              <strong>Back to the course</strong>
              <span>Twelve UI/UX lessons with live labs.</span>
            </a>
          </div>
        </div>
      </section>
    </ShowcaseShell>
  )
}
