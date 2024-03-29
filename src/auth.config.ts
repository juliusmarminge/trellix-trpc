import type { DefaultSession, NextAuthConfig } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db/client'
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
    }
  }
}

export const authConfig = {
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  providers: [],
  pages: { signIn: '/' },
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnBoards = nextUrl.pathname.startsWith('/boards')
      if (isOnBoards) return isLoggedIn
      return true
    },
  },
} satisfies NextAuthConfig
