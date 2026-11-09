'use client'

import React, { useState } from 'react'

import { isHex, text } from './tokens'
import type { RenderProps } from './types'

export function TokenField({ content }: RenderProps) {
  const label = text(content.label, 'Accent color', 60)
  const helper = text(content.helper, '', 120)
  const initial = isHex(content.value) ? content.value : '#4f46e5'
  const [value, setValue] = useState(initial)

  return (
    <div className="sc-token-field">
      <div className="sc-token-head">
        <label htmlFor="sc-token-color">{label}</label>
        <span className="sc-token-badge">Custom field</span>
      </div>
      <div className="sc-token-row">
        <input
          id="sc-token-color"
          type="color"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <input
          type="text"
          value={value}
          spellCheck={false}
          onChange={(event) => {
            const next = event.target.value
            setValue(next)
          }}
        />
        <span className="sc-token-swatch" style={{ background: isHex(value) ? value : '#4f46e5' }} />
      </div>
      {helper ? <p className="sc-token-helper">{helper}</p> : null}
    </div>
  )
}
