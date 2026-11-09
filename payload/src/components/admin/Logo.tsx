import React from 'react'

const markStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 7,
  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  display: 'inline-block',
  flex: '0 0 auto',
}

export function Logo() {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 10,
        padding: '6px 0',
      }}
    >
      <span style={markStyle} />
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--theme-elevation-1000)',
        }}
      >
        LUMINA
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: 'var(--theme-elevation-500)',
        }}
      >
        PAYLOAD
      </span>
    </div>
  )
}

export function Icon() {
  return <span style={markStyle} />
}
