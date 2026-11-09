import React from 'react'

import { list, text } from './tokens'
import type { RenderProps } from './types'
import { CTA } from './CTA'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import { Testimonial } from './Testimonial'

const blocks = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: CTA,
} as const

export function Page({ content, tokens }: RenderProps) {
  const heading = text(content.heading, '', 90)
  const sections = list<Record<string, unknown>>(content.sections).slice(0, 8)

  return (
    <div className="sc-page">
      {heading ? <h1 className="sc-page-heading">{heading}</h1> : null}
      {sections.map((section, index) => {
        const type = text(section.blockType, '', 30) as keyof typeof blocks
        const Block = blocks[type]
        if (!Block) return null
        return <Block key={index} content={section} tokens={tokens} compact />
      })}
    </div>
  )
}
