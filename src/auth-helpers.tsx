import 'server-only'

import { cache } from 'react'
import { auth as defaultAuth } from './auth'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

export const auth = cache(defaultAuth)

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
