import React from 'react'

import { bool, lines, list, text } from './tokens'
import type { RenderProps } from './types'

export function Pricing({ content }: RenderProps) {
  const heading = text(content.heading, 'Simple pricing', 80)
  const description = text(content.description, '', 220)
  const plans = list<Record<string, unknown>>(content.plans).slice(0, 4)

  return (
    <section className="sc-section">
      <header className="sc-section-head">
        <h2 className="sc-section-title">{heading}</h2>
        {description ? <p className="sc-body">{description}</p> : null}
      </header>
      <div className="sc-pricing" data-count={plans.length}>
        {plans.map((plan, index) => {
          const featured = bool(plan.featured)
          return (
            <article
              key={index}
              className={`sc-plan ${featured ? 'sc-plan-featured' : ''}`}
            >
              {featured ? <span className="sc-plan-badge">Most popular</span> : null}
              <h3 className="sc-plan-name">{text(plan.name, 'Plan', 40)}</h3>
              <p className="sc-plan-price">
                <strong>{text(plan.price, '$0', 20)}</strong>
                <span>{text(plan.period, '', 30)}</span>
              </p>
              <ul className="sc-plan-features">
                {lines(plan.features).map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a
                className={`sc-btn sc-btn-${featured ? 'primary' : 'secondary'} sc-btn-md`}
                href="#"
              >
                {text(plan.cta, 'Choose plan', 40)}
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
