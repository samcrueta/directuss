import React from 'react'

import { bool, text } from './tokens'
import type { RenderProps } from './types'

export function Button({ content }: RenderProps) {
  const label = text(content.label, 'Button', 40)
  const variant = text(content.variant, 'primary', 20)
  const size = text(content.size, 'md', 10)
  const icon = text(content.icon, '', 4)
  const disabled = bool(content.disabled)
  const loading = bool(content.loading)

  return (
    <div className="sc-center">
      <button
        type="button"
        className={`sc-btn sc-btn-${variant} sc-btn-${size}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
      >
        {loading ? <span className="sc-spinner" aria-hidden="true" /> : null}
        <span>{loading ? 'Working…' : label}</span>
        {!loading && icon ? (
          <span className="sc-btn-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </button>
    </div>
  )
}
