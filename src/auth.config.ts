import type { DefaultSession, NextAuthConfig } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
    }
  }
}

export const authConfig = {
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
