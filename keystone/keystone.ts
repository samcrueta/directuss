import 'dotenv/config'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { createAuth } from '@keystone-6/auth'
import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'

import { registerLuminaApi } from './lumina'
import { lists } from './schema'
import { seedDatabase } from './seed/core'

const sessionSecret =
  process.env.SESSION_SECRET || '-- change this keystone session secret --'
const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name role',
})

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      prismaClientOptions: () => ({
        adapter: new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL || 'file:./data/keystone.db',
        }),
      }),
      async onConnect(context) {
        await seedDatabase(context).catch((error) => {
          console.error('[keystone seed]', error)
        })
      },
    },
    lists,
    ui: {
      publicPages: ['/showcase'],
      isAccessAllowed: ({ session }) => Boolean(session),
    },
    session: statelessSessions({
      maxAge: 60 * 60 * 24 * 30,
      secret: sessionSecret,
      secure: false,
    }),
    server: {
      port: Number(process.env.PORT) || 3003,
      cors: {
        origin: [webOrigin],
        credentials: true,
      },
      extendExpressApp: async (app, commonContext) => {
        registerLuminaApi(app, commonContext)
      },
    },
    graphql: {
      path: '/api/graphql',
    },
  })
)
