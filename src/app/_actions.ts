'use server'

import { db } from '@/db/client'
import { z } from 'zod'
import { protectedAction, protectedBoardAction, redirect } from '@/trpc'
import { revalidatePath, revalidateTag } from 'next/cache'
import { Board, createBoardSchema } from '@/db/schema'
import { genId } from '@/utils'
import { eq } from 'drizzle-orm'

export const createBoard = protectedAction
  .input(
    createBoardSchema.superRefine(async (it, ctx) => {
      // FIXME: This should just be unique per user
      const board = await db.query.Board.findFirst({
        where: (fields) => eq(fields.name, it.name),
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
  .mutation(async ({ ctx, input }) => {
    const publicId = genId('brd')

    await db.insert(Board).values({
      ...input,
      publicId,
      ownerId: ctx.user.id,
    })
    revalidatePath(`/`)
    revalidateTag('user_boards')
    return redirect(`/boards/${publicId}`)
  })

export const updateBoardName = protectedBoardAction
  .input(z.object({ newName: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .update(Board)
      .set({
        name: input.newName,
      })
      .where(eq(Board.publicId, input.boardId))
    revalidateTag('board-details')
    revalidateTag('user_boards')
  })
