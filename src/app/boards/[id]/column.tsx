import 'client-only'

import { EditableText } from '@/app/components/primitives'
import type { ItemType } from '@/db/schema'
import type { Transfer } from '@/utils'
import { CONTENT_TYPES, invariant } from '@/utils'
import { PlusIcon } from 'lucide-react'
import { useState, useCallback, useRef, forwardRef } from 'react'

import { flushSync } from 'react-dom'
import { Card, NewCard } from './card'
import { moveItem, updateColumnName } from '@/app/_actions'

interface ColumnProps {
  name: string
  boardId: string
  columnId: string
  items: ItemType[]
}

export const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ name, columnId, boardId, items }, ref) => {
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

    // const moveCard = useMoveCardMutation()

    return (
      <div
        ref={ref}
        className={
          'flex-shrink-0 flex max-h-full w-80 flex-col overflow-hidden rounded-xl border-slate-400 bg-slate-100 shadow-sm shadow-slate-400 ' +
          (acceptDrop ? `outline-brand-red outline outline-2` : ``)
        }
        onDragOver={(event) => {
          if (
            items.length === 0 &&
            event.dataTransfer.types.includes(CONTENT_TYPES.card)
          ) {
            event.preventDefault()
            setAcceptDrop(true)
          }
        }}
        onDragLeave={() => {
          setAcceptDrop(false)
        }}
        onDrop={async (event) => {
          const transfer = JSON.parse(
            event.dataTransfer.getData(CONTENT_TYPES.card),
          ) as Transfer
          invariant(transfer.id, 'missing transfer.id')
          invariant(transfer.title, 'missing transfer.title')

          await moveItem({
            boardId,
            columnId,
            id: transfer.id,
            order: 1,
          })

          setAcceptDrop(false)
        }}
      >
        <div className="p-2">
          <EditableText
            onSubmit={async (str) => {
              await updateColumnName({ boardId, columnId, newName: str })
            }}
            fieldName="name"
            value={name}
            inputLabel="Edit column name"
            buttonLabel={`Edit column "${name}" name`}
            inputClassName="border border-slate-400 w-full rounded-lg py-1 px-2 font-medium text-black"
            buttonClassName="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-slate-600"
          >
            <input type="hidden" name="id" value={columnId} />
          </EditableText>
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
                boardId={boardId}
                order={item.order}
                columnId={columnId}
                previousOrder={items[index - 1] ? items[index - 1].order : 0}
                nextOrder={
                  items[index + 1] ? items[index + 1].order : item.order + 1
                }
              />
            ))}
        </ul>
        {edit ? (
          <NewCard
            columnId={columnId}
            boardId={boardId}
            nextOrder={
              items.length === 0 ? 1 : items[items.length - 1].order + 1
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
  },
)
