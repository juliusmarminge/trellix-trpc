'use client'
// import { useCallback, useRef } from 'react'
// import { invariant } from '@/utils'

// import { NewColumn } from './new-column.tsx'
// import { Column as ColumnComponent } from './column.tsx'

// import { INTENTS } from './types.ts'
import { EditableText } from './primitives'
import { updateBoardName } from '../_actions'
import type { BoardType } from '@/db/schema'

export function Board(props: { board: BoardType }) {
  const { board } = props

  // // scroll right when new columns are added
  // const scrollContainerRef = useRef<HTMLDivElement>(null)
  // const columnRef = useCallback((node: HTMLElement | null) => {
  //   if (node) {
  //     invariant(scrollContainerRef.current, 'no scroll container')
  //     scrollContainerRef.current.scrollLeft =
  //       scrollContainerRef.current.scrollWidth
  //   }
  // }, [])

  // const itemsById = new Map(board.items.map((item) => [item.id, item]))
  // type ColumnWithItems = Column & { items: typeof board.items }
  // const columns = new Map<string, ColumnWithItems>()
  // for (const column of [...board.columns]) {
  //   columns.set(column.id, { ...column, items: [] })
  // }

  // // add items to their columns
  // for (const item of itemsById.values()) {
  //   const columnId = item.columnId
  //   const column = columns.get(columnId)
  //   invariant(column, 'missing column')
  //   column.items.push(item)
  // }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-x-scroll"
      // ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <h1>
        <EditableText
          onSubmit={(str) =>
            updateBoardName({ boardId: board.publicId, newName: str })
          }
          value={board.name}
          fieldName="name"
          inputClassName="mx-8 my-4 text-2xl font-medium border border-slate-400 rounded-lg py-1 px-2 text-black"
          buttonClassName="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
          buttonLabel={`Edit board "${board.name}" name`}
          inputLabel="Edit board name"
        >
          {/* <input type="hidden" name="intent" value={INTENTS.updateBoardName} /> */}
          <input type="hidden" name="boardId" value={board.publicId} />
        </EditableText>
      </h1>

      {/* <div className="flex-grow flex h-full min-h-0 items-start gap-4 px-8 pb-4">
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
      </div> */}

      {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
      <div data-lol className="flex-shrink-0 h-1 w-8" />
    </div>
  )
}
