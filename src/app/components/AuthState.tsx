import { auth, signIn, signOut } from '@/auth'
import { AcmeIcon, GitHubIcon } from './Icons'
import { env } from '@/env'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import Link from 'next/link'

export async function AuthState() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="border-brand-aqua flex w-full max-w-sm flex-col gap-8 rounded-2xl border bg-slate-900 p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-2">
          <AcmeIcon />
          <span className="text-lg font-bold text-slate-200">
            Welcome back, {session.user.name}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/1"
            className="rounded-full border border-slate-700 bg-gray-800 py-2 px-4 text-center text-sm text-slate-200"
          >
            Go to board
          </Link>
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
    )
  }

  return (
    <div className="border-brand-aqua flex w-full max-w-sm flex-col gap-8 rounded-2xl border bg-slate-900 p-8 shadow-lg">
      <div className="flex flex-col items-center justify-center gap-2">
        <AcmeIcon />
        <span className="text-lg font-bold text-slate-200">
          Sign in to use Trellix
        </span>
      </div>

      <form
        className="flex w-full flex-col gap-2"
        action={async (fd) => {
          'use server'
          try {
            await signIn('credentials', fd)
          } catch (err) {
            if (err instanceof AuthError) {
              // do something
            }
          }
          redirect('/1')
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
          try {
            await signIn('github')
          } catch (err) {
            if (err instanceof AuthError) {
              // do something
            }
          }
          redirect('/1')
        }}
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 py-2 px-4 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:pointer-events-none disabled:opacity-50"
          disabled={!env.AUTH_GITHUB_ID || !env.AUTH_GITHUB_SECRET}
        >
          <GitHubIcon className="size-4" />
          <span>Continue with GitHub</span>
        </button>
      </form>
    </div>
  )
}
