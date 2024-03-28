import 'client-only'
import { useState, useRef } from 'react'

import { CancelButton, SaveButton } from '@/app/components/primitives'
import { genId, invariant } from '@/utils'
import { PlusIcon } from 'lucide-react'
import { createColumn } from '@/app/_actions'

export function NewColumn({
  boardId,
  editInitially,
  onColumnAdd,
}: {
  boardId: string
  editInitially: boolean
  onColumnAdd: (col: { id: string; name: string }) => void
}) {
  const [editing, setEditing] = useState(editInitially)
  const inputRef = useRef<HTMLInputElement>(null)

  return editing ? (
    <form
      className="flex max-h-full w-80 flex-col gap-5 overflow-hidden rounded-xl border bg-slate-100 p-2 shadow"
      action={async (fd) => {
        invariant(inputRef.current, 'missing input ref')
        inputRef.current.value = ''
        onColumnAdd({
          id: fd.get('id') as string,
          name: fd.get('name') as string,
        })
        await createColumn(fd as any)
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
