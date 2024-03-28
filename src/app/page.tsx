import React, { Suspense } from 'react'
import { SignedIn, SignedOut } from '@/auth-helpers'

import { signIn, signOut } from '@/auth'
import { BoardList } from './components/board-list'

import { env } from '@/env'
import { Columns4, Github, Loader2 } from 'lucide-react'

export default async function Home() {
  return (
    <main className="grid h-full grow">
      <Suspense
        fallback={
          <div className="grid aspect-square w-full max-w-sm place-self-center rounded-2xl bg-slate-900">
            <Loader2 className="size-16 animate-spin place-self-center stroke-slate-200" />
          </div>
        }
      >
        <SignedIn>
          {({ user }) => (
            <div className="flex min-h-96 w-full max-w-sm flex-col gap-8 place-self-center rounded-2xl bg-slate-900 p-8 shadow-lg">
              <div className="flex flex-col items-center justify-center gap-2">
                <Columns4 className="size-6 stroke-slate-200" />
                <span className="text-lg font-bold text-slate-200">
                  Welcome back, {user.name}
                </span>
              </div>
              <BoardList userId={user.id} />

              <div className="flex flex-col gap-2">
                <form
                  action={async () => {
                    'use server'
                    await signOut()
                  }}
                >
                  <button
                    type="submit"
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 py-2 px-4 text-sm text-slate-200 transition-colors hover:border-slate-500"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <div className="flex min-h-96 w-full max-w-sm flex-col gap-8 place-self-center rounded-2xl bg-slate-900 p-8 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-2">
              <Columns4 className="size-6 stroke-slate-200" />
              <span className="text-lg font-bold text-slate-200">
                Sign in to use Trellix
              </span>
            </div>

            <form
              className="flex w-full flex-col gap-2"
              action={async (fd) => {
                'use server'
                await signIn('credentials', fd)
              }}
            >
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-200">Name</span>
                <input
                  name="username"
                  required
                  className="rounded-full border-slate-700 bg-gray-800 py-2 px-4 text-sm text-slate-200"
                  placeholder="John Doe"
                />
              </label>
              <button
                type="submit"
                className="rounded-full border border-slate-700 bg-slate-900/80 py-2 px-4 text-sm text-slate-200 transition-colors hover:border-slate-500"
              >
                Sign in
              </button>
            </form>

            <div className="relative h-px w-full bg-slate-700">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-2 text-xs text-slate-500">
                or
              </span>
            </div>

            <form
              action={async () => {
                'use server'
                await signIn('github')
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 py-2 px-4 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:pointer-events-none disabled:opacity-50"
                disabled={!env.AUTH_GITHUB_ID || !env.AUTH_GITHUB_SECRET}
              >
                <Github className="size-4" />
                <span>Continue with GitHub</span>
              </button>
            </form>
          </div>
        </SignedOut>
      </Suspense>
    </main>
  )
}
