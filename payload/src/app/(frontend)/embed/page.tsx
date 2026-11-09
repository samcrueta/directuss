'use client'

import React, { useEffect, useState } from 'react'

import { Renderer } from '@/components/showcase/Renderer'
import type { ComponentSpec } from '@/components/showcase/types'

export default function EmbedPage() {
  const [spec, setSpec] = useState<ComponentSpec | null>(null)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return
      const data = event.data as
        | { source?: string; type?: string; spec?: ComponentSpec }
        | null
      if (!data || data.source !== 'lumina-lab') return
      if (data.type === 'hello') {
        window.parent.postMessage({ source: 'lumina-embed', type: 'ready' }, '*')
        return
      }
      if (data.type === 'render' && data.spec) {
        setSpec(data.spec)
      }
    }

    window.addEventListener('message', onMessage)
    window.parent.postMessage({ source: 'lumina-embed', type: 'ready' }, '*')
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (!spec) {
    return <div className="sc-embed-loading">Waiting for the builder…</div>
  }

  return (
    <div className="sc-embed">
      <Renderer spec={spec} />
    </div>
  )
}
