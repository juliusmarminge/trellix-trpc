import 'server-only'

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import { db } from '../db/client'
import { z } from 'zod'
import { User } from '../db/schema'
import { genId } from '../utils'
import { authConfig } from './config'
import { cache } from 'react'

import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

async function hash(password: string) {
  return new Promise<string>((resolve, reject) => {
    const salt = randomBytes(16).toString('hex')
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}.${derivedKey.toString('hex')}`)
    })
  })
}

async function compare(password: string, hash: string) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashKey] = hash.split('.')
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(timingSafeEqual(Buffer.from(hashKey, 'hex'), derivedKey))
    })
  })
}

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
            username: z.string().min(1).max(32),
            password: z.string().min(6).max(32),
          })
          .safeParse(c)
        if (!credentials.success) return null

        try {
          const user = await db.query.User.findFirst({
            where: (fields, ops) =>
              ops.sql`${fields.name} = ${credentials.data.username} COLLATE NOCASE`,
          })
          if (user) {
            if (!user.hashedPassword) return null
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
              hashedPassword: await hash(credentials.data.password),
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
