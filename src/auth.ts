import type { DefaultSession } from 'next-auth'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import { db } from './db/client'
import { z } from 'zod'
import { User } from './db/schema'
import { genId } from './utils'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
    }
  }
}

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Github,
    Credentials({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(c) {
        /**
         * FIXME: Add passwords
         */
        const credentials = z
          .object({
            username: z.string().min(1),
          })
          .parse(c)

        const user = await db.query.User.findFirst({
          where: (fields, ops) => ops.eq(fields.name, credentials.username),
        })
        if (user) {
          return {
            id: user.publicId,
            name: user.name,
          }
        }

        const [newUser] = await db
          .insert(User)
          .values({
            publicId: genId('usr'),
            name: credentials.username,
          })
          .returning()
        return {
          id: newUser.publicId,
          name: newUser.name,
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
