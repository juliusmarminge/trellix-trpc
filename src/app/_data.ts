import { db } from '@/db/client'
import { and, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

export const getBoardWithItems = unstable_cache(
  async (userId: string, boardId: string) => {
    const board = await db.query.Board.findFirst({
      with: {
        items: true,
        columns: true,
      },
      where: (fields) =>
        and(eq(fields.ownerId, userId), eq(fields.id, boardId)),
    })
    return board
  },
  undefined,
  { tags: ['board_details'] },
)
export type BoardWithItems = NonNullable<
  Awaited<ReturnType<typeof getBoardWithItems>>
>

export const getBoards = unstable_cache(
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
