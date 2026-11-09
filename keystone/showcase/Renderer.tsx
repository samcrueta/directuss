'use client'

import React from 'react'

import { registry } from './registry'
import { normalizeSpec, tokenStyle } from './tokens'
import type { ComponentSpec } from './types'

export function Renderer({
  spec,
  compact = false,
  admin,
}: {
  spec: ComponentSpec
  compact?: boolean
  admin?: boolean
}) {
  const normalized = normalizeSpec(spec)
  const Component = registry[normalized.kind]
  const isAdmin = admin || normalized.surface === 'admin'
  const tokens = normalized.tokens

  if (!Component) {
    return (
      <div className="sc-root sc-missing">
        <p>Unknown component: {normalized.kind}</p>
      </div>
    )
  }

  return (
    <div
      className={`sc-root ${compact ? 'sc-compact' : ''}`}
      data-theme={normalized.tokens.theme}
      style={tokenStyle(tokens)}
    >
      {isAdmin ? (
        <div className="sc-admin-shell">
          <div className="sc-admin-bar">
            <span className="sc-admin-dot" />
            <span>Keystone admin preview</span>
          </div>
          <div className="sc-admin-body">
            <Component content={normalized.content} tokens={tokens} compact={compact} />
          </div>
        </div>
      ) : (
        <Component content={normalized.content} tokens={tokens} compact={compact} />
      )}
    </div>
  )
}
