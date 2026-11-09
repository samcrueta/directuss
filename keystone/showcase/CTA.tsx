import React from 'react'

import { safeHref, text } from './tokens'
import type { RenderProps } from './types'

export function CTA({ content }: RenderProps) {
  const heading = text(content.heading, 'Ready to publish?', 80)
  const body = text(content.body, '', 220)
  const label = text(content.label, '', 40)
  const href = text(content.href, '#', 200)
  const tone = text(content.tone, 'accent', 12)

  return (
    <section className={`sc-cta sc-cta-${tone}`}>
      <div>
        <h2 className="sc-cta-title">{heading}</h2>
        {body ? <p className="sc-body">{body}</p> : null}
      </div>
      {label ? (
        <a className="sc-btn sc-btn-primary sc-btn-md" href={safeHref(href)}>
          {label} <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </section>
  )
}
