import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { credentials } from './config'
import * as schema from './schema'

const turso = createClient(credentials)
export const db = drizzle(turso, { schema })
