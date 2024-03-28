import 'server-only'
import { initTRPC, TRPCError } from '@trpc/server'
import { experimental_nextAppDirCaller } from '@trpc/server/adapters/next-app-dir'
import { cache } from 'react'
import { auth } from './auth'
import { db } from './db/client'
import { z } from 'zod'
import { unstable_cache } from 'next/cache'

export { experimental_redirect as redirect } from '@trpc/server/adapters/next-app-dir'

const t = initTRPC.create()

const createContext = cache(async () => {
  const session = await auth()
  return { user: session?.user }
})

const nextProc = t.procedure
  .use(async (opts) => {
    const ctx = await createContext()

    if (t._config.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }

    return opts.next({ ctx })
  })
  .experimental_caller(experimental_nextAppDirCaller({}))

/**
 * Public proc
 */
export const publicAction = nextProc

/**
 * Protected proc
 */
export const protectedAction = nextProc.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }

  return opts.next({
    ctx: {
      user: opts.ctx.user,
    },
  })
})

export const protectedBoardAction = protectedAction
  .input(z.object({ boardId: z.string() }))
  .use(async (opts) => {
    const board = await db.query.Board.findFirst({
      where: (fields, ops) =>
        ops.and(
          ops.eq(fields.ownerId, opts.ctx.user.id),
          ops.eq(fields.id, opts.input.boardId),
        ),
    })
    if (!board) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    return opts.next({
      ctx: {
        user: opts.ctx.user,
        board,
      },
    })
  })

// Maybe? Something like this would be nice. Haven't tested it yet.
export const cachedDataLayer = (cacheTag: string) =>
  protectedAction.use(async (opts) => {
    return unstable_cache(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (_: unknown) => {
        const res = await opts.next()
        if (!res.ok) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
        return res // should maybe make sure this is serializable
      },
      [opts.ctx.user.id],
      { tags: [cacheTag] },
    )(opts.input)
  })

// export const getX = cachedDataLayer('x').query(async (opts) => {
//   return 'some data'
// })
