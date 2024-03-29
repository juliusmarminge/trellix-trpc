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
import { and, count, eq } from 'drizzle-orm'
import { currentUser, signIn } from '@/auth'
import { AuthError } from 'next-auth'

/**
 * Temporary little type hack to cast a trpc action
 * when passing the action to `useFormState`
 * @example useFormState(createBoard as MakeAction<typeof createBoard>)
 */
export type MakeAction<T> = T extends (...args: any[]) => Promise<infer U>
  ? (state: any, fd: FormData) => Promise<U>
  : never

export const createBoard = protectedAction
  .input(
    createBoardSchema.superRefine(async (it, ctx) => {
      const { id: userId } = await currentUser()
      const board = await db.query.Board.findFirst({
        where: (fields) =>
          and(eq(fields.name, it.name), eq(fields.ownerId, userId)),
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
    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
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

    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
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

    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
    revalidateTag('user_boards')
  })

export const createColumn = protectedBoardAction
  .input(createColumnSchema)
  .mutation(async ({ input }) => {
    try {
      // FIXME: Single SQL query
      const [{ order }] = await db
        .select({ order: count() })
        .from(Column)
        .where(eq(Column.boardId, input.boardId))

      await db.insert(Column).values({
        id: input.id,
        boardId: input.boardId,
        name: input.name,
        // order: sql`SELECT (COUNT(*) + 1) FROM ${Column} WHERE ${Column.boardId} = ${input.boardId}`,
        order: order + 1,
      })

      revalidatePath(`/boards/${input.boardId}`)
      // revalidateTag('board_details')
      return { ok: true as const }
    } catch (err) {
      console.error('Error creating column', err)
      return { ok: false as const, error: 'Internal server error' }
    }
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

    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
  })

export const deleteColumn = protectedBoardAction
  .input(z.object({ columnId: z.string() }))
  .mutation(async ({ input }) => {
    try {
      await Promise.all([
        db.delete(Item).where(eq(Item.columnId, input.columnId)),
        db.delete(Column).where(eq(Column.id, input.columnId)),
      ])

      revalidatePath(`/boards/${input.boardId}`)
      // revalidateTag('board_details')
      return { ok: true as const }
    } catch (err) {
      console.error('Error deleting column', err)
      return { ok: false as const, error: 'Internal server error' }
    }
  })

export const createItem = protectedBoardAction
  .input(createItemSchema)
  .mutation(async ({ input }) => {
    try {
      await db.insert(Item).values({
        id: input.id,
        boardId: input.boardId,
        columnId: input.columnId,
        order: input.order,
        title: input.title,
      })

      revalidatePath(`/boards/${input.boardId}`)
      // revalidateTag('board_details')
      return { ok: true as const }
    } catch (err) {
      console.error('Error creating item', err)
      return { ok: false as const, error: 'Internal server error' }
    }
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

    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
  })

export const deleteItem = protectedBoardAction
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db.delete(Item).where(eq(Item.id, input.id))

    revalidatePath(`/boards/${input.boardId}`)
    // revalidateTag('board_details')
  })

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
