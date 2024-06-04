import 'client-only'
import type { MakeAction } from '@/app/_actions'
import { createItem, deleteItem, moveItem } from '@/app/_actions'
import {
  createTransfer,
  genId,
  invariant,
  isCardTransfer,
  parseTransfer,
} from '@/utils'
import { Button, TextArea } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import { forwardRef, useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  title: string
  content: string | null
  id: string
  columnId: string
  boardId: string
  order: number
  nextOrder: number
  previousOrder: number
  onDelete: () => void
  onMove: (cardId: string, toColumnId: string, order: number) => void
}
type AcceptDrop = 'none' | 'top' | 'bottom'

export const Card = forwardRef<HTMLLIElement, CardProps>(
  ({ title, content, id, columnId, boardId, order, ...props }, ref) => {
    const [acceptDrop, setAcceptDrop] = useState<AcceptDrop>('none')

    return (
      <li
        ref={ref}
        onDragOver={(event) => {
          if (isCardTransfer(event)) {
            event.preventDefault()
            event.stopPropagation()
            const rect = event.currentTarget.getBoundingClientRect()
            const midpoint = (rect.top + rect.bottom) / 2
            setAcceptDrop(event.clientY <= midpoint ? 'top' : 'bottom')
          }
        }}
        onDragLeave={() => {
          setAcceptDrop('none')
        }}
        onDrop={async (event) => {
          event.stopPropagation()

          const transfer = parseTransfer(event.dataTransfer)
          const droppedOrder =
            acceptDrop === 'top' ? props.previousOrder : props.nextOrder
          const moveOrder = (droppedOrder + order) / 2

          props.onMove(transfer.id, columnId, moveOrder)
          setAcceptDrop('none')
          await moveItem({
            boardId,
            columnId,
            id: transfer.id,
            order: moveOrder,
          })
        }}
        className={twMerge(
          '-mb-[2px] cursor-grab border-t-2 border-b-2 border-t-transparent border-b-transparent py-1 px-2 last:mb-0 active:cursor-grabbing',
          acceptDrop === 'top' && 'border-t-brand-red border-b-transparent',
          acceptDrop === 'bottom' && 'border-b-brand-red border-t-transparent',
        )}
      >
        <div
          draggable
          className="relative w-full rounded-lg border-slate-300 bg-white py-1 px-2 text-sm shadow shadow-slate-300"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            createTransfer(event.dataTransfer, { id, title })
          }}
        >
          <h3>{title}</h3>
          <div className="mt-2">{content ?? <>&nbsp;</>}</div>
          <form
            action={async (fd) => {
              props.onDelete()
              await deleteItem(fd as any)
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="boardId" value={boardId} />
            <button
              aria-label="Delete card"
              className="hover:text-brand-red hover:border-brand-red absolute top-2 right-2 rounded border border-transparent p-1"
              type="submit"
            >
              <Trash2Icon className="size-4" />
            </button>
          </form>
        </div>
      </li>
    )
  },
)

interface NewCardProps {
  columnId: string
  boardId: string
  nextOrder: number
  onCreate: (item: { id: string; title: string; order: number }) => void
  onComplete: () => void
}

export function NewCard({
  columnId,
  boardId,
  nextOrder,
  onCreate,
  onComplete,
}: NewCardProps) {
  const [itemId, setItemId] = useState(genId('itm'))
  const [state, dispatch] = useActionState(
    createItem as MakeAction<typeof createItem>,
    undefined,
  )

  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <form
      key={itemId}
      className="flex flex-col gap-2 pt-1 px-2 pb-2"
      action={(fd) => {
        onCreate(Object.fromEntries(fd.entries()) as any)
        dispatch(fd)
      }}
      onSubmit={() => setItemId(genId('itm'))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete()
        }
      }}
    >
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="columnId" value={columnId} />
      <input type="hidden" name="order" value={nextOrder} />

      <TextArea
        autoFocus
        required
        name="title"
        placeholder="Enter a title for this card"
        className="h-14 w-full resize-none rounded-lg py-1 px-2 text-sm shadow outline-none placeholder:text-sm placeholder:text-slate-500"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            invariant(buttonRef.current, 'expected button ref')
            buttonRef.current.click()
          }
          if (event.key === 'Escape') {
            onComplete()
          }
        }}
        onChange={(event) => {
          const el = event.currentTarget
          el.style.height = el.scrollHeight + 'px'
        }}
      />
      <div className="flex justify-between">
        <Button ref={buttonRef}>Save Card</Button>
        <Button onClick={onComplete} color="gray">
          Cancel
        </Button>
      </div>
    </form>
  )
}
