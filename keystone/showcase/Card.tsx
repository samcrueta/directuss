import React from 'react'

import { safeHref, text } from './tokens'
import type { RenderProps } from './types'

export function Card({ content }: RenderProps) {
  const align = text(content.align, 'left', 10)
  const eyebrow = text(content.eyebrow, '', 48)
  const title = text(content.title, 'Card title', 90)
  const body = text(content.body, '', 280)
  const ctaLabel = text(content.ctaLabel, '', 40)
  const ctaHref = text(content.ctaHref, '#', 200)

  return (
    <article className={`sc-card sc-card-${align}`}>
      {eyebrow ? <p className="sc-eyebrow">{eyebrow}</p> : null}
      <h2 className="sc-card-title">{title}</h2>
      {body ? <p className="sc-body">{body}</p> : null}
      {ctaLabel ? (
        <a className="sc-link" href={safeHref(ctaHref)}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </article>
  )
}
