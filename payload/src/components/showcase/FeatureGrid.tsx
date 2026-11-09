import React from 'react'

import { list, text } from './tokens'
import type { RenderProps } from './types'

export function FeatureGrid({ content }: RenderProps) {
  const heading = text(content.heading, 'Why blocks?', 80)
  const description = text(content.description, '', 220)
  const columns = text(content.columns, '3', 2)
  const features = list<Record<string, unknown>>(content.features).slice(0, 6)

  return (
    <section className="sc-section">
      <header className="sc-section-head">
        <h2 className="sc-section-title">{heading}</h2>
        {description ? <p className="sc-body">{description}</p> : null}
      </header>
      <div className="sc-feature-grid" data-columns={columns}>
        {features.map((feature, index) => (
          <article key={index} className="sc-feature">
            <span className="sc-feature-icon" aria-hidden="true">
              {text(feature.icon, '◇', 4)}
            </span>
            <h3 className="sc-feature-title">{text(feature.title, 'Feature', 60)}</h3>
            {feature.body ? <p className="sc-body">{text(feature.body, '', 180)}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
