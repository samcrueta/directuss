'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import React from 'react'

const HEX = /^#[0-9a-f]{6}$/i

export const ColorField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const safe = typeof value === 'string' && HEX.test(value) ? value : '#4f46e5'
  const label = typeof field?.label === 'string' ? field.label : 'Color'

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label
        htmlFor={path}
        style={{ fontSize: 12, fontWeight: 600, color: 'var(--theme-elevation-800)' }}
      >
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          aria-label={`${label} picker`}
          type="color"
          value={safe}
          onChange={(event) => setValue(event.target.value)}
          style={{
            width: 44,
            height: 38,
            padding: 2,
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-0)',
            cursor: 'pointer',
          }}
        />
        <input
          id={path}
          type="text"
          value={value ?? ''}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          style={{
            width: 130,
            padding: '9px 10px',
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-1000)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 13,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            background: safe,
            border: '1px solid var(--theme-elevation-200)',
          }}
        />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-elevation-500)' }}>
        Six-digit hex. Stored with the component and rendered as a CSS variable.
      </p>
    </div>
  )
}
