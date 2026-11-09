import type { ComponentType } from 'react'

import { AdminStatCard } from './AdminStatCard'
import { Button } from './Button'
import { Card } from './Card'
import { ContactForm } from './ContactForm'
import { CTA } from './CTA'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import { Page } from './Page'
import { Pricing } from './Pricing'
import { Testimonial } from './Testimonial'
import { TokenField } from './TokenField'
import type { RenderProps } from './types'

export const registry: Record<string, ComponentType<RenderProps>> = {
  card: Card,
  button: Button,
  contactForm: ContactForm,
  adminStatCard: AdminStatCard,
  tokenField: TokenField,
  page: Page,
  pricing: Pricing,
  testimonial: Testimonial,
  hero: Hero,
  featureGrid: FeatureGrid,
  cta: CTA,
}
