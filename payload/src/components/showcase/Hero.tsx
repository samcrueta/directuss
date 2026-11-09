import React from 'react'

import { safeHref, text } from './tokens'
import type { RenderProps } from './types'

export function Hero({ content }: RenderProps) {
  const align = text(content.alignment, 'left', 10)
  const eyebrow = text(content.eyebrow, '', 48)
  const title = text(content.title, 'A page built from blocks', 90)
  const body = text(content.body, '', 280)
  const primaryLabel = text(content.primaryLabel, '', 40)
  const primaryHref = text(content.primaryHref, '#', 200)
  const secondaryLabel = text(content.secondaryLabel, '', 40)
  const secondaryHref = text(content.secondaryHref, '#', 200)
  const art = text(content.art, 'gradient', 12)

  return (
    <section className={`sc-hero sc-hero-${align}`}>
      <div className="sc-hero-copy">
        {eyebrow ? <p className="sc-eyebrow">{eyebrow}</p> : null}
        <h1 className="sc-hero-title">{title}</h1>
        {body ? <p className="sc-hero-body">{body}</p> : null}
        {(primaryLabel || secondaryLabel) && (
          <div className="sc-hero-actions">
            {primaryLabel ? (
              <a className="sc-btn sc-btn-primary sc-btn-md" href={safeHref(primaryHref)}>
                {primaryLabel}
              </a>
            ) : null}
            {secondaryLabel ? (
              <a
                className="sc-btn sc-btn-secondary sc-btn-md"
                href={safeHref(secondaryHref)}
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        )}
      </div>
      {art !== 'none' ? (
        <div className={`sc-hero-art sc-hero-art-${art}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </section>
  )
}
