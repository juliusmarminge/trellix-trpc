import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from 'libsql-client'
import { credentials } from './config'
import * as schema from './schema'

const turso = createClient(credentials)
export const db = drizzle(turso, { schema })
