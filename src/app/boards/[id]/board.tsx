'use client'
import { useCallback, useRef } from 'react'
import { invariant } from '@/utils'
import { Column as ColumnComponent } from './column'
import { EditableText } from '../../components/primitives'
import { deleteBoard, updateBoardName } from '../../_actions'
import type { BoardWithItems } from '../../_data'
import type { ColumnType, ItemType } from '@/db/schema'
import { NewColumn } from './new-column'
import { ArrowLeft, Trash2Icon } from 'lucide-react'
import Link from 'next/link'

export function Board(props: { board: BoardWithItems }) {
  const { board } = props

  // scroll right when new columns are added
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const columnRef = useCallback(
    (node: HTMLElement | null) => {
      if (node && scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft =
          scrollContainerRef.current.scrollWidth
      }
    },
    [scrollContainerRef],
  )

  const itemsById = new Map(board.items.map((item) => [item.id, item]))
  type ColumnWithItems = ColumnType & { items: ItemType[] }
  const columns = new Map<string, ColumnWithItems>()
  for (const column of [...board.columns]) {
    columns.set(column.id, { ...column, items: [] })
  }

  // add items to their columns
  for (const item of itemsById.values()) {
    const columnId = item.columnId
    const column = columns.get(columnId)
    invariant(column, 'missing column')
    column.items.push(item)
  }

  return (
    <div
      className="flex h-full min-h-0 grow flex-col overflow-x-scroll py-4 px-8"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-medium">
          <Link href="/">
            <ArrowLeft />
          </Link>
          <EditableText
            onSubmit={(str) =>
              updateBoardName({ boardId: board.id, newName: str })
            }
            value={board.name}
            fieldName="name"
            inputClassName="border border-slate-400 rounded-lg py-1 px-2 text-black"
            buttonClassName="rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
            buttonLabel={`Edit board "${board.name}" name`}
            inputLabel="Edit board name"
          >
            <input type="hidden" name="boardId" value={board.id} />
          </EditableText>
        </h1>

        <form
          // @ts-expect-error - fix in trpc
          action={deleteBoard}
        >
          <input type="hidden" name="boardId" value={board.id} />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-slate-900 py-2 px-4 text-sm text-slate-200 transition-colors hover:bg-slate-800"
          >
            <Trash2Icon className="size-4" />
            Delete board
          </button>
        </form>
      </div>

      <div className="flex-grow flex h-full min-h-0 items-start gap-4 px-8 pb-4">
        {[...columns.values()].map((col) => {
          return (
            <ColumnComponent
              ref={columnRef}
              key={col.id}
              name={col.name}
              columnId={col.id}
              boardId={board.id}
              items={col.items}
            />
          )
        })}
        <NewColumn
          boardId={board.id}
          editInitially={board.columns.length === 0}
        />
      </div>

      {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
      <div data-lol className="flex-shrink-0 h-1 w-8" />
    </div>
  )
}
