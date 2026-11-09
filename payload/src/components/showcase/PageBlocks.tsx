import React from 'react'

import { DEFAULT_TOKENS } from './tokens'
import { Renderer } from './Renderer'

export function PageBlocks({
  blocks,
  title,
}: {
  blocks: Array<Record<string, unknown>>
  title?: string
}) {
  return (
    <Renderer
      spec={{
        kind: 'page',
        surface: 'public',
        content: {
          heading: title || '',
          sections: blocks,
        },
        tokens: DEFAULT_TOKENS,
      }}
    />
  )
}
