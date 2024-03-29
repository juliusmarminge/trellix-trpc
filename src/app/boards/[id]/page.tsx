import { getBoardWithItems } from '@/app/_data'
import Link from 'next/link'
import { Board } from './board'

export default async function BoardPage(props: { params: { id: string } }) {
  const board = await getBoardWithItems(props.params.id)

  if (!board) {
    return (
      <div className="flex h-full max-w-sm grow flex-col items-center justify-center place-self-center">
        <h1 className="text-lg font-bold">Board not found</h1>
        <p>
          This board either does not exist, or you are not authorized to access
          it.{' '}
          <Link href="/" className="underline">
            Go back home
          </Link>
        </p>
      </div>
    )
  }

  return <Board board={board} />
}
