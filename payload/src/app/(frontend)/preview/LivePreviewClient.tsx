'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { PageBlocks } from '@/components/showcase/PageBlocks'

type PreviewData = {
  title?: string | null
  layout?: Array<Record<string, unknown>> | null
}

export function LivePreviewClient({
  initialData,
  serverURL,
}: {
  initialData: PreviewData
  serverURL: string
}) {
  const { data } = useLivePreview<PreviewData>({
    initialData,
    serverURL,
    depth: 2,
  })

  const layout = Array.isArray(data?.layout) ? data.layout : []
  const title = typeof data?.title === 'string' ? data.title : ''

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageBlocks blocks={layout} title={title} />
    </div>
  )
}
