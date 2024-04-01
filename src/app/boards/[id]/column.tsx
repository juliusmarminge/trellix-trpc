import 'client-only'
import type { MakeAction } from '@/app/_actions'
import {
  createColumn,
  deleteColumn,
  moveItem,
  updateColumnName,
} from '@/app/_actions'
import { EditableText } from '@/app/components/editable-text'
import type { ItemType } from '@/db/schema'
import { genId, invariant, isCardTransfer, parseTransfer } from '@/utils'
import { Button } from '@radix-ui/themes'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import {
  forwardRef,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { flushSync, useFormState } from 'react-dom'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { Card, NewCard } from './card'

interface ColumnProps {
  name: string
  boardId: string
  columnId: string
  items: ItemType[]
  onColumnDelete: (columnId: string) => void
  onCardAdd: (item: { id: string; title: string; order: number }) => void
  onCardDelete: (itemId: string) => void
  onCardMove: (itemId: string, toColumnId: string, order: number) => void
}

export const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ items, columnId, boardId, ...props }, ref) => {
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

    const [state, dispatchDelete] = useFormState(
      deleteColumn as MakeAction<typeof deleteColumn>,
      undefined,
    )
    useEffect(() => {
      if (state?.error) toast.error(`Error deleting column: ${state.error}`)
    }, [state])

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
          startTransition(() => props.onCardMove(transfer.id, columnId, 1))
          await moveItem({
            boardId: boardId,
            columnId: columnId,
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
                boardId: boardId,
                columnId: columnId,
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
            <input type="hidden" name="id" value={columnId} />
          </EditableText>
          <form
            className="p-2"
            action={(fd) => {
              props.onColumnDelete(columnId)
              dispatchDelete(fd)
            }}
          >
            <input type="hidden" name="boardId" value={boardId} />
            <input type="hidden" name="columnId" value={columnId} />
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
                content={item.content}
                id={item.id}
                boardId={boardId}
                columnId={columnId}
                previousOrder={items[index - 1]?.order ?? 0}
                order={item.order}
                nextOrder={items[index + 1]?.order ?? item.order + 1}
                onDelete={() => props.onCardDelete(item.id)}
                onMove={(cardId, toColumnId, order) =>
                  props.onCardMove(cardId, toColumnId, order)
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
            onCreate={(item) => props.onCardAdd(item)}
            onComplete={() => setEdit(false)}
          />
        ) : (
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                flushSync(() => setEdit(true))
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

interface NewColumnProps {
  boardId: string
  editInitially: boolean
  onCreate: (col: { id: string; name: string }) => void
}

export function NewColumn({
  boardId,
  editInitially,
  onCreate,
}: NewColumnProps) {
  const [editing, setEditing] = useState(editInitially)
  const inputRef = useRef<HTMLInputElement>(null)

  const [state, dispatch] = useFormState(
    createColumn as MakeAction<typeof createColumn>,
    undefined,
  )
  useEffect(() => {
    if (state?.error) toast.error(`Error creating column: ${state.error}`)
  }, [state])

  return editing ? (
    <form
      className="flex max-h-full w-80 flex-col gap-5 overflow-hidden rounded-xl border bg-slate-100 p-2 shadow"
      action={(fd) => {
        invariant(inputRef.current, 'missing input ref')
        inputRef.current.value = ''
        onCreate({
          id: fd.get('id') as string,
          name: fd.get('name') as string,
        })
        dispatch(fd)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEditing(false)
        }
      }}
    >
      <input type="hidden" name="id" value={genId('col')} />
      <input type="hidden" name="boardId" value={boardId} />
      <input
        autoFocus
        required
        ref={inputRef}
        type="text"
        name="name"
        className="w-full rounded-lg border border-slate-400 py-1 px-2 font-medium text-black"
      />
      <div className="flex justify-between">
        <Button>Save Column</Button>
        <Button color="gray" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  ) : (
    <button
      onClick={() => {
        setEditing(true)
      }}
      aria-label="Add new column"
      className="flex h-16 w-16 justify-center rounded-xl bg-black/20 hover:bg-black/10"
    >
      <PlusIcon className="size-8 self-center" />
    </button>
  )
}
