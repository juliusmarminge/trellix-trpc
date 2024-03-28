'use client'

import { useCallback, useOptimistic, useRef, useState } from 'react'
import { Column } from './column'
import { EditableText } from '../../components/primitives'
import { deleteBoard, updateBoardColor, updateBoardName } from '../../_actions'
import type { BoardWithColumns } from '../../_data'
import { NewColumn } from './new-column'
import { ArrowLeft, PaletteIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import Block from '@uiw/react-color-block'

export function Board({ board }: { board: BoardWithColumns }) {
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

  const [columns, updateColumns] = useOptimistic(
    new Map(Object.entries(board.columns)),
    (
      state,
      action:
        | { intent: 'add'; id: string; name: string }
        | { intent: 'delete'; id: string },
    ) => {
      if (action.intent === 'add') {
        state.set(action.id, {
          boardId: board.id,
          id: action.id,
          items: [],
          order: Object.keys(state).length,
          name: action.name,
        })
      } else if (action.intent === 'delete') {
        state.delete(action.id)
      }
      return state
    },
  )

  return (
    <div
      className="flex h-full min-h-0 grow flex-col gap-4 overflow-x-scroll py-4 px-8"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <BoardToolbar id={board.id} color={board.color} name={board.name} />
      <div className="flex-grow flex h-full min-h-0 items-start gap-4 px-8 pb-4">
        {[...columns.values()].map((col) => {
          return (
            <Column
              ref={columnRef}
              key={col.id}
              name={col.name}
              columnId={col.id}
              boardId={board.id}
              items={col.items}
              onColumnDelete={(id) => updateColumns({ intent: 'delete', id })}
            />
          )
        })}
        <NewColumn
          boardId={board.id}
          editInitially={Object.keys(board.columns).length === 0}
          onColumnAdd={(col: { id: string; name: string }) =>
            updateColumns({ intent: 'add', ...col })
          }
        />
      </div>

      {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
      <div data-lol className="flex-shrink-0 h-1 w-8" />
    </div>
  )
}

function BoardToolbar(props: { id: string; color: string; name: string }) {
  const { id, color, name } = props

  // FIXME: Shouldn't need JS for this.
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="flex flex-1 items-center gap-2 text-2xl font-medium">
        <Link href="/">
          <ArrowLeft />
        </Link>
        <EditableText
          onSubmit={(newName) => updateBoardName({ boardId: id, newName })}
          value={name}
          fieldName="name"
          inputClassName="border border-slate-400 w-full rounded-lg py-1 px-2 text-black"
          buttonClassName="rounded-lg text-left border w-max border-transparent py-1 px-2 text-slate-800"
          buttonLabel={`Edit board "${name}" name`}
          inputLabel="Edit board name"
        >
          <input type="hidden" name="boardId" value={id} />
        </EditableText>
      </h1>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          {/* FIXME: Solve this with vanilla HTML/CSS */}
          <button onClick={() => setShowPalette((c) => !c)}>
            <PaletteIcon className="size-8" />
          </button>
          <Block
            className={`absolute! top-10 right-0 ${showPalette ? 'block' : 'hidden'}`}
            color={color}
            onChange={async (color) => {
              await updateBoardColor({
                boardId: id,
                newColor: color.hex,
              })
            }}
          />
        </div>

        <form action={deleteBoard as any}>
          <input type="hidden" name="boardId" value={id} />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-slate-900 py-2 px-4 text-sm text-slate-200 transition-colors hover:bg-slate-800"
          >
            <Trash2Icon className="size-4" />
            Delete board
          </button>
        </form>
      </div>
    </div>
  )
}
