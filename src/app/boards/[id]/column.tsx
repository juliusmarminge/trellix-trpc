import 'client-only'

import { twMerge } from 'tailwind-merge'
import { EditableText } from '@/app/components/primitives'
import type { ItemType } from '@/db/schema'

import { invariant, isCardTransfer, parseTransfer } from '@/utils'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState, useCallback, useRef, forwardRef, useOptimistic } from 'react'

import { flushSync } from 'react-dom'
import { Card, NewCard } from './card'
import { deleteColumn, moveItem, updateColumnName } from '@/app/_actions'

interface ColumnProps {
  name: string
  boardId: string
  columnId: string
  items: ItemType[]
  onColumnDelete: (columnId: string) => void
}

export const Column = forwardRef<HTMLDivElement, ColumnProps>((props, ref) => {
  const [acceptDrop, setAcceptDrop] = useState(false)
  const [edit, setEdit] = useState(false)
  const itemRef = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView()
  }, [])

  const listRef = useRef<HTMLUListElement>(null)

  function scrollList() {
    invariant(listRef.current)
    listRef.current.scrollTop = listRef.current.scrollHeight
  }

  const [items, updateItems] = useOptimistic(
    props.items,
    (
      state,
      action:
        | { intent: 'add'; id: string; title: string }
        | { intent: 'delete'; id: string },
    ) => {
      const newItems = [...state]
      if (action.intent === 'add') {
        newItems.push({
          boardId: props.boardId,
          columnId: props.columnId,
          content: null,
          title: action.title,
          id: action.id,
          order: newItems.length,
        })
      } else if (action.intent === 'delete') {
        const idx = newItems.findIndex((item) => item.id === action.id)
        if (idx > -1) {
          newItems.splice(idx, 1)
        }
      }
      return newItems
    },
  )

  return (
    <div
      ref={ref}
      className={twMerge(
        'flex-shrink-0 flex max-h-full w-80 flex-col overflow-hidden rounded-xl border-slate-400 bg-slate-100 shadow-sm shadow-slate-400 ',
        acceptDrop && `outline-brand-red outline outline-2`,
      )}
      onDragOver={(event) => {
        if (items.length === 0 && isCardTransfer(event)) {
          event.preventDefault()
          setAcceptDrop(true)
        }
      }}
      onDragLeave={() => {
        setAcceptDrop(false)
      }}
      onDrop={async (event) => {
        const transfer = parseTransfer(event.dataTransfer)

        await moveItem({
          boardId: props.boardId,
          columnId: props.columnId,
          id: transfer.id,
          order: 1,
        })

        setAcceptDrop(false)
      }}
    >
      <div className="flex items-center gap-2 p-2">
        <EditableText
          onSubmit={async (newName) => {
            await updateColumnName({
              boardId: props.boardId,
              columnId: props.columnId,
              newName,
            })
          }}
          fieldName="name"
          value={props.name}
          inputLabel="Edit column name"
          buttonLabel={`Edit column "${props.name}" name`}
          inputClassName="border border-slate-400 w-full rounded-lg py-1 px-2 font-medium text-black"
          buttonClassName="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-slate-600"
        >
          <input type="hidden" name="id" value={props.columnId} />
        </EditableText>
        <form
          className="p-2"
          action={async (fd) => {
            props.onColumnDelete(props.columnId)
            await deleteColumn(fd as any)
          }}
        >
          <input type="hidden" name="boardId" value={props.boardId} />
          <input type="hidden" name="columnId" value={props.columnId} />
          <button
            type="submit"
            className="hover:text-brand-red hover:border-brand-red rounded border border-transparent p-1"
          >
            <Trash2Icon className="size-4" />
          </button>
        </form>
      </div>

      <ul ref={listRef} className="flex-grow overflow-auto">
        {[...items]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item, index, items) => (
            <Card
              ref={itemRef}
              key={item.id}
              title={item.title}
              content={item.content ?? ''}
              id={item.id}
              boardId={props.boardId}
              order={item.order}
              columnId={props.columnId}
              previousOrder={items[index - 1] ? items[index - 1].order : 0}
              nextOrder={
                items[index + 1] ? items[index + 1].order : item.order + 1
              }
              onCardDelete={(id) => updateItems({ intent: 'delete', id })}
            />
          ))}
      </ul>
      {edit ? (
        <NewCard
          columnId={props.columnId}
          boardId={props.boardId}
          nextOrder={items.length === 0 ? 1 : items[items.length - 1].order + 1}
          onCardCreate={(item: { id: string; title: string }) =>
            updateItems({ intent: 'add', ...item })
          }
          onComplete={() => setEdit(false)}
        />
      ) : (
        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              flushSync(() => {
                setEdit(true)
              })
              scrollList()
            }}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-left font-medium text-slate-500 hover:bg-slate-200 focus:bg-slate-200"
          >
            <PlusIcon /> Add a card
          </button>
        </div>
      )}
    </div>
  )
})
