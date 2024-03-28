import { genRandomName } from '@/utils'
import { createBoard } from '../_actions'
import { getBoards } from '../_data'
import { faker } from '@faker-js/faker'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export async function BoardList(props: { userId: string }) {
  const boards = await getBoards(props.userId)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-200">Your boards</span>
        <form action={createBoard as any}>
          <input type="hidden" name="name" value={genRandomName()} />
          <input type="hidden" name="color" value={faker.color.rgb()} />
          <button
            type="submit"
            className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-sm text-slate-200 transition-colors hover:border-slate-500"
          >
            <PlusIcon className="size-4" />
          </button>
        </form>
      </div>
      {boards.length === 0 && (
        <span className="text-sm text-slate-500">No boards yet</span>
      )}
      {boards.length > 0 && (
        <ul className="flex flex-col gap-2">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="flex items-center gap-4 text-slate-200"
              >
                <span
                  style={{ backgroundColor: board.color }}
                  className="size-4 rounded-full"
                />
                <span>{board.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
