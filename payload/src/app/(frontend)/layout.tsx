import React from 'react'

import '@/components/showcase/showcase.css'
import './styles.css'

export const metadata = {
  title: 'Advanced Payload · Lumina Academy',
  description:
    'The Level 7 UI/UX component showcase, rendered by Payload from learner submissions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
