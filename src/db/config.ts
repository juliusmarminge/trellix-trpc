import { env } from '@/env'
import type { Config } from 'drizzle-kit'

export const credentials = {
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
}

export default {
  schema: './src/db/schema.ts',
  driver: 'turso',
  dbCredentials: credentials,
} satisfies Config
