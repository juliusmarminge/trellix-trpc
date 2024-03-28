'use server'

import { db } from '@/db/client'

import { protectedAction, redirect } from '@/trpc'
import { revalidatePath, revalidateTag } from 'next/cache'
import { Board, createBoardSchema } from '@/db/schema'
import { genId } from '@/utils'

export const createBoard = protectedAction
  .input(
    createBoardSchema.superRefine(async (it, ctx) => {
      // FIXME: This should just be unique per user
      const board = await db.query.Board.findFirst({
        where: (fields, ops) => ops.eq(fields.name, it.name),
      })
      if (board) {
        ctx.addIssue({
          code: 'custom',
          message: `Board ${it.name} already exists`,
          path: ['name'],
        })
      }
    }),
  )
  .mutation(async (opts) => {
    const publicId = genId('brd')

    await db.insert(Board).values({
      ...opts.input,
      publicId,
      ownerId: opts.ctx.user.id,
    })
    revalidatePath(`/`)
    revalidateTag('user_boards')
    return redirect(`/boards/${publicId}`)
  })
