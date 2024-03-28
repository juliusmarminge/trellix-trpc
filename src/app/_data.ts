import { db } from '@/db/client'
import { and, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

export const getBoard = unstable_cache(
  async (userId: string, boardId: string) => {
    const board = await db.query.Board.findFirst({
      with: {
        items: true,
        columns: true,
      },
      where: (fields) =>
        and(eq(fields.ownerId, userId), eq(fields.id, boardId)),
    })
    if (!board) notFound()
    return board
  },
  undefined,
  { tags: ['board-details'] },
)
export type BoardWithItems = Awaited<ReturnType<typeof getBoard>>
