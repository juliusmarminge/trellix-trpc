'use client'

import { AlertDialog, Button, IconButton, Popover } from '@radix-ui/themes'
import { ArrowLeft, PaletteIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useCallback, useRef, useState } from 'react'
import type { MakeAction } from '../../_actions'
import { deleteBoard, updateBoardColor, updateBoardName } from '../../_actions'
import type { BoardWithColumns } from '../../_data'
import { EditableText } from '../../components/editable-text'
import { Column, NewColumn } from './column'
import { useOptimisticBoard } from './use-optimistic-board'

export function Board(props: { board: BoardWithColumns }) {
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

  const { board, columns, optimisticUpdate } = useOptimisticBoard(props.board)

  return (
    <div
      className="flex h-full min-h-0 grow flex-col gap-4 overflow-x-scroll py-4 px-8"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <BoardToolbar
        id={board.id}
        color={board.color}
        name={board.name}
        optUpdateColor={(color) =>
          optimisticUpdate({ intent: 'updClr', color })
        }
      />
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
              onDelete={() =>
                optimisticUpdate({ intent: 'delCol', id: col.id })
              }
              onCardAdd={(itm) =>
                optimisticUpdate({ intent: 'addItm', columnId: col.id, ...itm })
              }
              onCardDelete={(id) =>
                optimisticUpdate({ intent: 'delItm', columnId: col.id, id })
              }
              onCardMove={(id, toColumnId, order) =>
                optimisticUpdate({ intent: 'moveItm', id, toColumnId, order })
              }
            />
          )
        })}
        <NewColumn
          boardId={board.id}
          editInitially={board.columns.length === 0}
          onCreate={(col) => optimisticUpdate({ intent: 'addCol', ...col })}
        />
      </div>
    </div>
  )
}

function useDebounce<A extends any[], R>(fn: (...args: A) => R, delay = 100) {
  const ref = useRef<ReturnType<typeof setTimeout>>()
  return (...args: A) => {
    clearTimeout(ref.current)
    ref.current = setTimeout(() => fn(...args), delay)
  }
}

function BoardToolbar(props: {
  id: string
  color: string
  name: string
  optUpdateColor: (color: string) => void
}) {
  const { id, name } = props
  const [, dispatch] = useActionState(
    updateBoardColor as MakeAction<typeof updateBoardColor>,
    undefined,
  )

  const formRef = useRef<HTMLFormElement>(null)
  const [color, setColor] = useState(props.color)
  const updateColor = useDebounce((color: string) => {
    setColor(color)
    formRef.current?.requestSubmit()
  })

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
            <form
              ref={formRef}
              action={(fd) => {
                props.optUpdateColor(fd.get('newColor') as string)
                dispatch(fd)
              }}
            >
              <input type="hidden" name="boardId" value={id} />
              <input
                type="color"
                name="newColor"
                value={color}
                className="h-16"
                onChange={(e) => updateColor(e.target.value)}
              />
            </form>
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
