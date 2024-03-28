'use server'

import { db } from '@/db/client'
import { z } from 'zod'
import { protectedAction, protectedBoardAction, redirect } from '@/trpc'
import { revalidatePath, revalidateTag } from 'next/cache'
import {
  Board,
  Column,
  Item,
  createBoardSchema,
  createColumnSchema,
  createItemSchema,
} from '@/db/schema'
import { genId } from '@/utils'
import { count, eq } from 'drizzle-orm'

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
    const id = genId('brd')

    await db.insert(Board).values({
      ...input,
      id,
      ownerId: ctx.user.id,
    })

    revalidatePath(`/`)
    revalidateTag('user_boards')
    return redirect(`/boards/${id}`)
  })

export const deleteBoard = protectedBoardAction
  .input(z.object({ boardId: z.string() }))
  .mutation(async ({ input }) => {
    await Promise.all([
      db.delete(Item).where(eq(Item.boardId, input.boardId)),
      db.delete(Column).where(eq(Column.boardId, input.boardId)),
      db.delete(Board).where(eq(Board.id, input.boardId)),
    ])

    revalidateTag('user_boards')
    revalidateTag('board-details')
    return redirect('/')
  })

export const updateBoardName = protectedBoardAction
  .input(z.object({ newName: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .update(Board)
      .set({
        name: input.newName,
      })
      .where(eq(Board.id, input.boardId))

    revalidateTag('board-details')
    revalidateTag('user_boards')
  })

export const createColumn = protectedBoardAction
  .input(createColumnSchema)
  .mutation(async ({ input }) => {
    // FIXME: Single SQL query
    const [{ order }] = await db
      .select({ order: count() })
      .from(Column)
      .where(eq(Column.boardId, input.boardId))

    const id = genId('col')
    await db.insert(Column).values({
      id,
      boardId: input.boardId,
      name: input.name,
      order: order + 1,
    })

    revalidateTag('board-details')
  })

export const updateColumnName = protectedBoardAction
  .input(z.object({ columnId: z.string(), newName: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .update(Column)
      .set({
        name: input.newName,
      })
      .where(eq(Column.id, input.columnId))

    revalidateTag('board-details')
  })

export const createItem = protectedBoardAction
  .input(createItemSchema)
  .mutation(async ({ input }) => {
    const [{ order }] = await db
      .select({ order: count() })
      .from(Column)
      .where(eq(Column.id, input.columnId))

    const id = genId('itm')
    await db.insert(Item).values({
      id,
      boardId: input.boardId,
      columnId: input.columnId,
      order: order + 1,
      title: input.title,
    })

    revalidateTag('board-details')
  })

export const moveItem = protectedBoardAction
  .input(z.object({ id: z.string(), columnId: z.string(), order: z.number() }))
  .mutation(async ({ input }) => {
    await db
      .update(Item)
      .set({
        columnId: input.columnId,
        order: input.order,
      })
      .where(eq(Item.id, input.id))

    revalidateTag('board-details')
  })

export const deleteItem = protectedBoardAction
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db.delete(Item).where(eq(Item.id, input.id))

    revalidateTag('board-details')
  })
