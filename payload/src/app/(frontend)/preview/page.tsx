import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { LivePreviewClient } from './LivePreviewClient'

export const dynamic = 'force-dynamic'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    return (
      <main
        style={{
          alignItems: 'center',
          background: '#0b0b0e',
          color: '#a1a1aa',
          display: 'flex',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          height: '100vh',
          justifyContent: 'center',
          margin: 0,
          padding: 24,
          textAlign: 'center',
        }}
      >
        Open a page in the Payload admin and choose Live Preview.
      </main>
    )
  }

  const payload = await getPayload({ config })
  const page = await payload.findByID({
    collection: 'pages',
    id,
    depth: 2,
    draft: true,
    overrideAccess: true,
    disableErrors: true,
  })

  if (!page) notFound()

  return (
    <LivePreviewClient
      initialData={page}
      serverURL={process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}
    />
  )
}
