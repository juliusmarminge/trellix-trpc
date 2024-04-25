import { db } from '@/db/client'
import { Account, Authenticator, User } from '@/db/schema'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { and, eq } from 'drizzle-orm'
import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
} from 'next-auth/adapters'

/**
 * Drizzle Adapter with Passkey support
 */
export const drizzleAdapter = {
  ...DrizzleAdapter(db, {
    usersTable: User,
    accountsTable: Account,
    // I don't use DB Sessions or Email sign-in so I don't have these tables
    sessionsTable: {} as any,
    verificationTokensTable: {} as any,
  }),
  getAccount: async (providerAccountId, provider) => {
    const [account] = await db
      .select()
      .from(Account)
      .where(
        and(
          eq(Account.provider, provider),
          eq(Account.providerAccountId, providerAccountId),
        ),
      )
    return (account as AdapterAccount) ?? null
  },
  createAuthenticator: async (data) => {
    const id = crypto.randomUUID()
    await db.insert(Authenticator).values({
      id,
      ...data,
    })
    const [authenticator] = await db
      .select()
      .from(Authenticator)
      .where(eq(Authenticator.id, id))
    const { transports, id: _, ...rest } = authenticator
    return { ...rest, transports: transports ?? undefined }
  },
  getAuthenticator: async (credentialId) => {
    const [authenticator] = await db
      .select()
      .from(Authenticator)
      .where(eq(Authenticator.credentialID, credentialId))
    return (authenticator as AdapterAuthenticator) ?? null
  },
  listAuthenticatorsByUserId: async (userId) => {
    const auths = await db
      .select()
      .from(Authenticator)
      .where(eq(Authenticator.userId, userId))
    return auths.map((a) => ({
      ...a,
      transports: a.transports ?? undefined,
    }))
  },
  updateAuthenticatorCounter: async (credentialId, counter) => {
    await db
      .update(Authenticator)
      .set({ counter })
      .where(eq(Authenticator.credentialID, credentialId))
    const [authenticator] = await db
      .select()
      .from(Authenticator)
      .where(eq(Authenticator.credentialID, credentialId))
    return (authenticator as AdapterAuthenticator) ?? null
  },
} satisfies Adapter
