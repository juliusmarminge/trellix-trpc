import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string(),
    TURSO_DATABASE_URL: z.string(),
    TURSO_AUTH_TOKEN: z.string(),
  },
  experimental__runtimeEnv: {},
})
