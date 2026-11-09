import type { CSSProperties } from 'react'

import type { ComponentSpec, Tokens } from './types'

export type NormalizedSpec = Omit<ComponentSpec, 'tokens'> & { tokens: Tokens }

export const DEFAULT_TOKENS: Tokens = {
  theme: 'light',
  accent: '#4f46e5',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#64748b',
  radius: 14,
  spacing: 24,
  fontScale: 1,
  shadow: 'soft',
}

const HEX = /^#[0-9a-f]{6}$/i

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value)
}

function color(value: unknown, fallback: string) {
  return isHex(value) ? value : fallback
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number * 100) / 100))
}

export function sanitizeTokens(input: Partial<Tokens> | undefined | null): Tokens {
  const source = input ?? {}
  return {
    theme: source.theme === 'dark' ? 'dark' : 'light',
    accent: color(source.accent, DEFAULT_TOKENS.accent),
    background: color(source.background, DEFAULT_TOKENS.background),
    foreground: color(source.foreground, DEFAULT_TOKENS.foreground),
    muted: color(source.muted, DEFAULT_TOKENS.muted),
    radius: clamp(source.radius, 0, 32, DEFAULT_TOKENS.radius),
    spacing: clamp(source.spacing, 8, 48, DEFAULT_TOKENS.spacing),
    fontScale: clamp(source.fontScale, 0.8, 1.4, DEFAULT_TOKENS.fontScale),
    shadow:
      source.shadow === 'none' || source.shadow === 'strong' ? source.shadow : 'soft',
  }
}

export function normalizeSpec(input: ComponentSpec | null | undefined): NormalizedSpec {
  const spec = input ?? { kind: 'unknown', content: {} }
  return {
    id: spec.id,
    name: typeof spec.name === 'string' ? spec.name.slice(0, 90) : 'Component',
    description:
      typeof spec.description === 'string' ? spec.description.slice(0, 500) : '',
    kind: typeof spec.kind === 'string' ? spec.kind : 'unknown',
    surface:
      spec.surface === 'admin' || spec.surface === 'internal' ? spec.surface : 'public',
    content:
      spec.content && typeof spec.content === 'object'
        ? (spec.content as Record<string, unknown>)
        : {},
    tokens: sanitizeTokens(spec.tokens),
    lessonSlug: typeof spec.lessonSlug === 'string' ? spec.lessonSlug : undefined,
    featured: Boolean(spec.featured),
    publishedAt: typeof spec.publishedAt === 'string' ? spec.publishedAt : null,
  }
}

export function tokenStyle(tokens: Tokens): CSSProperties {
  const shadow =
    tokens.shadow === 'strong'
      ? '0 24px 70px rgba(15, 23, 42, 0.24)'
      : tokens.shadow === 'soft'
        ? '0 18px 45px rgba(15, 23, 42, 0.12)'
        : 'none'

  return {
    '--sc-accent': tokens.accent,
    '--sc-bg': tokens.background,
    '--sc-fg': tokens.foreground,
    '--sc-muted': tokens.muted,
    '--sc-radius': `${tokens.radius}px`,
    '--sc-space': `${tokens.spacing}px`,
    '--sc-scale': tokens.fontScale,
    '--sc-shadow': shadow,
  } as CSSProperties
}

export function text(value: unknown, fallback = '', max = 500): string {
  if (typeof value !== 'string') return fallback
  return value.slice(0, max)
}

export function safeHref(value: unknown, fallback = '#'): string {
  const link = text(value, '', 200).trim()
  if (!link) return fallback
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('./') ||
    link.startsWith('../') ||
    link.startsWith('?') ||
    /^https?:\/\//i.test(link) ||
    /^mailto:/i.test(link) ||
    /^tel:/i.test(link)
  ) {
    return link
  }
  return fallback
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function num(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function list<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function lines(value: unknown): string[] {
  return text(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
}

export function relativeLuminance(hex: string): number {
  const safe = isHex(hex) ? hex.slice(1) : '000000'
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(safe.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const light = Math.max(l1, l2)
  const dark = Math.min(l1, l2)
  return (light + 0.05) / (dark + 0.05)
}
