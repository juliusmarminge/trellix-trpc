import 'client-only'

import { CancelButton, SaveButton } from '@/app/components/primitives'
import { createItem, deleteItem, moveItem } from '@/app/_actions'
import { useRef, forwardRef, useState } from 'react'
import type { Transfer } from '@/utils'
import { CONTENT_TYPES, invariant } from '@/utils'
import { Trash2Icon } from 'lucide-react'

interface CardProps {
  title: string
  content: string | null
  id: string
  columnId: string
  boardId: string
  order: number
  nextOrder: number
  previousOrder: number
}
type AcceptDrop = 'none' | 'top' | 'bottom'

export const Card = forwardRef<HTMLLIElement, CardProps>(
  (
    { title, content, id, columnId, boardId, order, nextOrder, previousOrder },
    ref,
  ) => {
    const [acceptDrop, setAcceptDrop] = useState<AcceptDrop>('none')

    return (
      <li
        ref={ref}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
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

          const transfer = JSON.parse(
            event.dataTransfer.getData(CONTENT_TYPES.card),
          ) as Transfer
          invariant(transfer.id, 'missing cardId')
          invariant(transfer.title, 'missing title')

          const droppedOrder = acceptDrop === 'top' ? previousOrder : nextOrder
          const moveOrder = (droppedOrder + order) / 2

          await moveItem({
            boardId,
            columnId,
            id: transfer.id,
            order: moveOrder,
          })

          setAcceptDrop('none')
        }}
        className={
          '-mb-[2px] cursor-grab border-t-2 border-b-2 py-1 px-2 last:mb-0 active:cursor-grabbing ' +
          (acceptDrop === 'top'
            ? 'border-t-brand-red border-b-transparent'
            : acceptDrop === 'bottom'
              ? 'border-b-brand-red border-t-transparent'
              : 'border-t-transparent border-b-transparent')
        }
      >
        <div
          draggable
          className="relative w-full rounded-lg border-slate-300 bg-white py-1 px-2 text-sm shadow shadow-slate-300"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData(
              CONTENT_TYPES.card,
              JSON.stringify({ id, title } satisfies Transfer),
            )
          }}
        >
          <h3>{title}</h3>
          <div className="mt-2">
            {
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              content || <>&nbsp;</>
            }
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              // const formData = new FormData(event.currentTarget)
              await deleteItem({ boardId, id })
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="boardId" value={boardId} />
            <button
              aria-label="Delete card"
              className="hover:text-brand-red absolute top-4 right-4"
              type="submit"
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <Trash2Icon className="size-4" />
            </button>
          </form>
        </div>
      </li>
    )
  },
)

export function NewCard({
  columnId,
  boardId,
  nextOrder,
  onComplete,
}: {
  columnId: string
  boardId: string
  nextOrder: number
  onComplete: () => void
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <form
      method="post"
      className="border-t-2 border-b-2 border-transparent py-1 px-2"
      onSubmit={async (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const id = crypto.randomUUID()
        formData.set('id', id)

        invariant(textAreaRef.current)
        textAreaRef.current.value = ''

        await createItem({
          boardId,
          columnId,
          title: formData.get('title') as string,
        })
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete()
        }
      }}
    >
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="columnId" value={columnId} />
      <input type="hidden" name="order" value={nextOrder} />

      <textarea
        autoFocus
        required
        ref={textAreaRef}
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
        <SaveButton ref={buttonRef}>Save Card</SaveButton>
        <CancelButton onClick={onComplete}>Cancel</CancelButton>
      </div>
    </form>
  )
}
