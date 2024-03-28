import 'client-only'
import { useState, useRef } from 'react'

import { CancelButton, SaveButton } from '@/app/components/primitives'
import { invariant } from '@/utils'
import { PlusIcon } from 'lucide-react'
import { createColumn } from '@/app/_actions'

export function NewColumn({
  boardId,
  editInitially,
}: {
  boardId: string
  editInitially: boolean
}) {
  const [editing, setEditing] = useState(editInitially)
  const inputRef = useRef<HTMLInputElement>(null)

  //   const { mutate } = useNewColumnMutation()

  return editing ? (
    <form
      className="flex max-h-full w-80 flex-col gap-5 overflow-hidden rounded-xl border bg-slate-100 p-2 shadow"
      onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        formData.set('id', crypto.randomUUID())
        invariant(inputRef.current, 'missing input ref')
        inputRef.current.value = ''
        await createColumn({ boardId, name: formData.get('name') as string })
        // mutate(newColumnSchema.parse(Object.fromEntries(formData.entries())))
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEditing(false)
        }
      }}
    >
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
        <SaveButton>Save Column</SaveButton>
        <CancelButton onClick={() => setEditing(false)}>Cancel</CancelButton>
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
