import 'dotenv/config'

import { getContext } from '@keystone-6/core/context'

import config from './keystone'
import * as PrismaModule from './generated/prisma/client'
import { seedDatabase } from './seed/core'

async function main() {
  const context = getContext(config, PrismaModule)
  await seedDatabase(context)
  console.log('[keystone seed] complete')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
