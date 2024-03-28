import { cache } from 'react'
import { auth } from './auth'
import { redirect } from 'next/navigation'

export const currentUser = cache(async () => {
  const sesh = await auth()
  if (!sesh?.user) redirect('/')
  return sesh.user
})
