import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Components } from './collections/Components'
import { Lessons } from './collections/Lessons'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Sections } from './collections/Sections'
import { Users } from './collections/Users'
import { ComponentCatalog } from './globals/ComponentCatalog'
import { ShowcaseSettings } from './globals/ShowcaseSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000'
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Lumina Payload',
      description: 'Advanced Payload: UI/UX components and the Level 7 showcase.',
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
      beforeLogin: ['/components/admin/BeforeLogin#BeforeLogin'],
      views: {
        dashboard: {
          Component: '/components/admin/Dashboard#Dashboard',
        },
      },
    },
  },
  collections: [Users, Media, Sections, Lessons, Components, Pages],
  globals: [ComponentCatalog, ShowcaseSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  cors: [webOrigin],
  csrf: [webOrigin],
  endpoints: [
    {
      path: '/lumina/health',
      method: 'get',
      handler: async () =>
        Response.json(
          {
            ok: true,
            service: 'payload',
            version: '3.92.0',
            showcase: `${serverURL}/showcase`,
          },
          { headers: { 'Cache-Control': 'no-store' } },
        ),
    },
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./data/payload.db',
    },
    wal: true,
    busyTimeout: 5000,
  }),
  sharp,
  plugins: [],
})
