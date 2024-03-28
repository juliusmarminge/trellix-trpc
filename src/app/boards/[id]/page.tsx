import { getBoard } from '@/app/_data'
import { currentUser } from '@/auth-helpers'
import { Board } from './board'

export default async function BoardPage(props: { params: { id: string } }) {
  const user = await currentUser()
  const board = await getBoard(user.id, props.params.id)

  console.log('board', board)

  return <Board board={board} />
}
