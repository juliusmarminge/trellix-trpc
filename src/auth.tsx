import 'server-only'

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import { db } from './db/client'
import { z } from 'zod'
import { User } from './db/schema'
import { genId } from './utils'
import { authConfig } from './auth.config'
import { cache } from 'react'

import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { compare, hash } from 'bcrypt'

const {
  auth: uncachedAuth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Github,
    Credentials({
      name: 'Credentials',
      async authorize(c) {
        const credentials = z
          .object({
            username: z.string().min(1),
            password: z.string().min(6),
          })
          .safeParse(c)
        if (!credentials.success) return null

        try {
          const user = await db.query.User.findFirst({
            where: (fields, ops) =>
              ops.sql`${fields.name} = ${credentials.data.username} COLLATE NOCASE`,
          })
          if (user) {
            const pwMatch = await compare(
              credentials.data.password,
              user.hashedPassword,
            )
            if (!pwMatch) return null
            return { id: user.id, name: user.name }
          }

          // Auto-signup new users - whatever...
          const [newUser] = await db
            .insert(User)
            .values({
              id: genId('usr'),
              name: credentials.data.username,
              hashedPassword: await hash(credentials.data.password, 10),
            })
            .returning()
          return { id: newUser.id, name: newUser.name }
        } catch {
          return null
        }
      },
    }),
  ],
})

export { signIn, signOut, GET, POST }

export const auth = cache(uncachedAuth)
export const currentUser = cache(async () => {
  const sesh = await auth()
  if (!sesh?.user) redirect('/')
  return sesh.user
})

export async function SignedIn(props: {
  children: (props: { user: Session['user'] }) => React.ReactNode
}) {
  const sesh = await auth()
  return sesh?.user ? <>{props.children({ user: sesh.user })}</> : null
}

export async function SignedOut(props: { children: React.ReactNode }) {
  const sesh = await auth()
  return sesh?.user ? null : <>{props.children}</>
}
