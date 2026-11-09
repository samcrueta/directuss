import React, { useEffect, useState } from 'react'

import { Renderer } from './Renderer'
import type { ComponentSpec } from './types'

export function EmbedPage() {
  const [spec, setSpec] = useState<ComponentSpec | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
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

  return (
    <div className="sc-embed">
      {spec ? (
        <Renderer spec={spec} />
      ) : (
        <div className="sc-embed-loading">Waiting for the builder…</div>
      )}
    </div>
  )
}
