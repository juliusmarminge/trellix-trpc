'use client'

import { genRandomName } from '@/utils'
import { faker } from '@faker-js/faker'
import { PlusIcon } from 'lucide-react'
import { useFormState } from 'react-dom'
import type { MakeAction } from '../_actions'
import { createBoard } from '../_actions'
import { SubmitButton } from './submit-button'

export function CreateBoard() {
  const [, dispatch] = useFormState(
    createBoard as MakeAction<typeof createBoard>,
    undefined,
  )

  return (
    <form action={dispatch}>
      <input type="hidden" name="name" value={genRandomName()} />
      <input type="hidden" name="color" value={faker.color.rgb()} />
      <SubmitButton className="w-max p-2">
        <PlusIcon className="size-4" />
      </SubmitButton>
    </form>
  )
}
