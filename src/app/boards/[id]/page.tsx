import { currentUser } from '@/auth-helpers'
import { db } from '@/db/client'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

const getBoard = unstable_cache(async (userId: string, boardId: string) => {
  const board = await db.query.Board.findFirst({
    where: (fields, ops) =>
      ops.and(ops.eq(fields.ownerId, userId), ops.eq(fields.publicId, boardId)),
  })
  if (!board) notFound()
  return board
})

export default async function BoardPage(props: { params: { id: string } }) {
  const user = await currentUser()
  const board = await getBoard(user.id, props.params.id)

  return (
    <div>
      <h1>{board.name}</h1>
    </div>
  )
}
