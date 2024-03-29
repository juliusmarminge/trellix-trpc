import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import { credentials } from './config'

const turso = createClient(credentials)
export const db = drizzle(turso, { schema })
