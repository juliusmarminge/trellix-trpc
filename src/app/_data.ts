import { currentUser } from '@/auth'
import { db } from '@/db/client'
import type { ItemType } from '@/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

/**
 * These seems to be some issue when caching this function and optimistically updating
 * the frontend. Let's just keep it uncached for now...
 */
// export const getBoardWithItems = unstable_cache(
//   async (userId: string, boardId: string) => {
//     const board = await db.query.Board.findFirst({
//       with: {
//         columns: {
//           with: {
//             items: { orderBy: (fields) => asc(fields.order) },
//           },
//         },
//       },
//       where: (fields) =>
//         and(eq(fields.ownerId, userId), eq(fields.id, boardId)),
//     })
//     if (!board) return null

//     return {
//       id: board.id,
//       color: board.color,
//       name: board.name,
//       columns: Object.fromEntries(board.columns.map((col) => [col.id, col])),
//     }
//   },
//   undefined,
//   { tags: ['board_details'] },
// )
export const getBoardWithItems = async (boardId: string) => {
  const { id: userId } = await currentUser()
  const board = await db.query.Board.findFirst({
    with: {
      items: { orderBy: (fields) => asc(fields.order) },
      columns: true,
    },
    where: (fields) => and(eq(fields.ownerId, userId), eq(fields.id, boardId)),
  })
  if (!board) return null

  const itemsById: Record<string, ItemType> = {}
  for (const itm of board.items) {
    itemsById[itm.id] = itm
  }

  return {
    id: board.id,
    color: board.color,
    name: board.name,
    items: itemsById,
    columns: board.columns,
  }
}
export type BoardWithColumns = NonNullable<
  Awaited<ReturnType<typeof getBoardWithItems>>
>

export const getUserBoards = async () => {
  const { id: userId } = await currentUser()
  return unstable_cache(
    async (userId: string) => {
      const boards = await db.query.Board.findMany({
        where: (fields, ops) => ops.eq(fields.ownerId, userId),
        columns: {
          id: true,
          color: true,
          name: true,
        },
      })
      return boards
    },
    undefined,
    { tags: ['user_boards'] },
  )(userId)
}
