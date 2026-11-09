import React from 'react'

import { text } from './tokens'
import type { RenderProps } from './types'

export function AdminStatCard({ content }: RenderProps) {
  const label = text(content.label, 'Published components', 60)
  const value = text(content.value, '0', 20)
  const delta = text(content.delta, '', 40)
  const trend = text(content.trend, 'flat', 10)
  const footnote = text(content.footnote, '', 80)
  const icon = text(content.icon, '◈', 4)

  return (
    <div className="sc-stat-card">
      <div className="sc-stat-top">
        <span className="sc-stat-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="sc-stat-label">{label}</span>
      </div>
      <div className="sc-stat-value-row">
        <strong className="sc-stat-value">{value}</strong>
        {delta ? (
          <span className={`sc-stat-delta sc-stat-${trend}`}>
            <span aria-hidden="true">
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>{' '}
            {delta}
          </span>
        ) : null}
      </div>
      <div className="sc-spark" aria-hidden="true">
        {[38, 52, 44, 68, 61, 78, 72, 90].map((height, index) => (
          <span key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
      {footnote ? <p className="sc-stat-foot">{footnote}</p> : null}
    </div>
  )
}
