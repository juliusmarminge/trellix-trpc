'use client'

import { AlertDialog, Button, IconButton, Popover } from '@radix-ui/themes'
import Block from '@uiw/react-color-block'
import { ArrowLeft, PaletteIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useOptimistic, useRef } from 'react'
import { deleteBoard, updateBoardColor, updateBoardName } from '../../_actions'
import type { BoardWithColumns } from '../../_data'
import { EditableText } from '../../components/editable-text'
import { Column, NewColumn } from './column'

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
    </div>
  )
}

function BoardToolbar(props: { id: string; color: string; name: string }) {
  const { id, color, name } = props

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
        <Popover.Root>
          <Popover.Trigger>
            <IconButton variant="ghost">
              <PaletteIcon className="size-6 stroke-slate-900" />
            </IconButton>
          </Popover.Trigger>
          <Popover.Content>
            <Block
              color={color}
              onChange={async (color) => {
                await updateBoardColor({
                  boardId: id,
                  newColor: color.hex,
                })
              }}
            />
          </Popover.Content>
        </Popover.Root>

        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <IconButton variant="ghost">
              <Trash2Icon className="size-6 stroke-slate-900" />
            </IconButton>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Delete board</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure? The board and all of it's content will be deleted
              permanently. This action cannot be undone.
            </AlertDialog.Description>

            <div className="mt-4 flex justify-end gap-4">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <form action={deleteBoard as any}>
                <input type="hidden" name="boardId" value={id} />
                <AlertDialog.Action>
                  <Button type="submit" variant="solid" color="red">
                    Delete board
                  </Button>
                </AlertDialog.Action>
              </form>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  )
}
