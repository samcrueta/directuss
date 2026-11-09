export type Surface = 'public' | 'admin' | 'internal'

export type Tokens = {
  theme: 'light' | 'dark'
  accent: string
  background: string
  foreground: string
  muted: string
  radius: number
  spacing: number
  fontScale: number
  shadow: 'none' | 'soft' | 'strong'
}

export type ComponentSpec = {
  id?: number | string
  name?: string
  description?: string
  kind: string
  surface?: Surface
  content: Record<string, unknown>
  tokens?: Partial<Tokens>
  html?: string
  css?: string
  js?: string
  lessonSlug?: string
  featured?: boolean
  publishedAt?: string | null
}

export type ShowcaseItem = {
  id: number | string
  name: string
  description?: string
  kind: string
  content: Record<string, unknown>
  tokens: Partial<Tokens>
  html: string
  css: string
  js: string
  lessonSlug?: string
  featured?: boolean
  publishedAt?: string | null
}

export type RenderProps = {
  content: Record<string, unknown>
  tokens: Tokens
  compact?: boolean
}
