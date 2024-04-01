import 'server-only'
import { tracing } from '@baselime/node-opentelemetry/trpc'
import { initTRPC, TRPCError } from '@trpc/server'
import { experimental_nextAppDirCaller } from '@trpc/server/adapters/next-app-dir'
import { unstable_cache } from 'next/cache'
import createPino from 'pino'
import { cache } from 'react'
import { z } from 'zod'
import { auth } from './auth'
import { db } from './db/client'

export { experimental_redirect as redirect } from '@trpc/server/adapters/next-app-dir'

const t = initTRPC.create()

const createContext = cache(async () => {
  const session = await auth()
  const logger = createPino({
    base: {
      source: 'trpc',
      user: session?.user,
    },
    ...(process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }
      : {}),
  })
  return { user: session?.user, logger }
})

const nextProc = t.procedure
  .use(tracing({ collectInput: true, collectResult: true }))
  .use(async (opts) => {
    const ctx = await createContext()
    const input = await opts.getRawInput()
    const logger = ctx.logger.child({ input })

    if (t._config.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }

    const start = Date.now()
    const res = await opts.next({ ctx: { ...ctx, logger } })
    const duration = Date.now() - start

    if (res.ok) logger.info({ duration, result: res.data })
    else logger.error({ duration, error: res.error })

    return res
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
