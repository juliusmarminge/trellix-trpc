import { Suspense } from 'react'
import { SignedIn, SignedOut } from '@/auth'

import { signOut } from '@/auth'
import { BoardList } from './components/board-list'

import { env } from '@/env'
import { Columns4 } from 'lucide-react'
import { SignInForm } from './components/sign-in'
import { Spinner } from '@radix-ui/themes'

export default async function Home() {
  return (
    <main className="grid h-full grow">
      <Suspense
        fallback={
          <div className="relative h-max w-full max-w-sm place-self-center">
            <div className=" absolute inset-0 z-40  grid rounded-2xl bg-slate-900 text-white">
              <Spinner size="3" className="z-50 place-self-center" />
            </div>
            <SignInForm githubEnabled={false} />
          </div>
        }
      >
        <SignedIn>
          {({ user }) => (
            <div className="flex h-max min-h-[437px] w-full max-w-sm flex-col gap-8 place-self-center rounded-2xl bg-slate-900 p-8 shadow-lg">
              <div className="flex flex-col items-center justify-center gap-2">
                <Columns4 className="size-6 stroke-slate-200" />
                <span className="text-center text-lg font-bold text-slate-200">
                  Welcome back, {user.name}
                </span>
              </div>
              <Suspense fallback={<BoardList.Loading />}>
                <BoardList userId={user.id} />
              </Suspense>

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
          <SignInForm
            githubEnabled={!!(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET)}
          />
        </SignedOut>
      </Suspense>
    </main>
  )
}
