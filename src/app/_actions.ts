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
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function signInWithCredentials(
  _prevState: { error: string } | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error
  }
}

export async function signInWithGithub() {
  await signIn('github')
}

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
    revalidateTag('board_details')
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

    revalidateTag('board_details')
    revalidateTag('user_boards')
  })

export const updateBoardColor = protectedBoardAction
  .input(z.object({ newColor: z.string().regex(/^#[0-9a-f]{6}$/i) }))
  .mutation(async ({ input }) => {
    await db
      .update(Board)
      .set({
        color: input.newColor,
      })
      .where(eq(Board.id, input.boardId))

    revalidateTag('board_details')
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

    await db.insert(Column).values({
      id: input.id,
      boardId: input.boardId,
      name: input.name,
      order: order + 1,
    })

    revalidateTag('board_details')
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

    revalidateTag('board_details')
  })

export const deleteColumn = protectedBoardAction
  .input(z.object({ columnId: z.string() }))
  .mutation(async ({ input }) => {
    await Promise.all([
      db.delete(Item).where(eq(Item.columnId, input.columnId)),
      db.delete(Column).where(eq(Column.id, input.columnId)),
    ])

    revalidateTag('board_details')
  })

export const createItem = protectedBoardAction
  .input(createItemSchema)
  .mutation(async ({ input }) => {
    const [{ order }] = await db
      .select({ order: count() })
      .from(Column)
      .where(eq(Column.id, input.columnId))

    await db.insert(Item).values({
      id: input.id,
      boardId: input.boardId,
      columnId: input.columnId,
      order: order + 1,
      title: input.title,
    })

    revalidateTag('board_details')
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

    revalidateTag('board_details')
  })

export const deleteItem = protectedBoardAction
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db.delete(Item).where(eq(Item.id, input.id))

    revalidateTag('board_details')
  })
