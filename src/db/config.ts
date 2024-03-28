import { env } from '@/env'
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  driver: 'turso',
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
} satisfies Config
