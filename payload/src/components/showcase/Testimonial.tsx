import React from 'react'

import { num, text } from './tokens'
import type { RenderProps } from './types'

export function Testimonial({ content }: RenderProps) {
  const quote = text(content.quote, 'A testimonial goes here.', 320)
  const author = text(content.author, 'Anonymous', 60)
  const role = text(content.role, '', 80)
  const company = text(content.company, '', 60)
  const rating = Math.max(0, Math.min(5, Math.round(num(content.rating, 5))))

  return (
    <figure className="sc-testimonial">
      <div className="sc-stars" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} aria-hidden="true" className={star <= rating ? 'sc-star-on' : ''}>
            ★
          </span>
        ))}
      </div>
      <blockquote className="sc-quote">“{quote}”</blockquote>
      <figcaption className="sc-attribution">
        <span className="sc-avatar" aria-hidden="true">
          {author.slice(0, 1).toUpperCase()}
        </span>
        <span>
          <strong>{author}</strong>
          {(role || company) && (
            <span className="sc-role">
              {role}
              {role && company ? ' · ' : ''}
              {company}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}
