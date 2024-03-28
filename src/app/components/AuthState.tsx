import { auth, signIn, signOut } from '@/auth'
import { AcmeIcon, GitHubIcon } from './Icons'
import { env } from '@/env'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { db } from '@/db/client'
import { createBoard } from '../_actions'
import { PlusIcon } from 'lucide-react'
import { genRandomName } from '@/utils'
import { faker } from '@faker-js/faker'
const getBoards = unstable_cache(
  (userId: string) =>
    db.query.Board.findMany({
      where: (fields, ops) => ops.eq(fields.ownerId, userId),
      columns: {
        id: true,
        color: true,
        name: true,
      },
    }),
  undefined,
  { tags: ['user_boards'] },
)

async function BoardList(props: { userId: string }) {
  const boards = await getBoards(props.userId)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-200">Your boards</span>
        <form
          // @ts-expect-error - fix in trpc
          action={createBoard}
        >
          <input type="hidden" name="name" value={genRandomName()} />
          <input type="hidden" name="color" value={faker.color.rgb()} />
          <button
            type="submit"
            className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-sm text-slate-200 transition-colors hover:border-slate-500"
          >
            <PlusIcon className="size-4" />
          </button>
        </form>
      </div>
      {boards.length === 0 && (
        <span className="text-sm text-slate-500">No boards yet</span>
      )}
      {boards.length > 0 && (
        <ul className="flex flex-col gap-2">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="flex items-center gap-4 text-slate-200"
              >
                <span
                  style={{ backgroundColor: board.color }}
                  className="size-4 rounded-full"
                />
                <span>{board.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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
        <BoardList userId={session.user.id} />

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
          <GitHubIcon className="size-4" />
          <span>Continue with GitHub</span>
        </button>
      </form>
    </div>
  )
}
