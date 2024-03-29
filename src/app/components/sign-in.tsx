'use client'

import { signInWithCredentials, signInWithGithub } from '@/app/_actions'
import { Columns4, Github } from 'lucide-react'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import { SubmitButton } from './submit-button'

export function SignInForm(props: { githubEnabled: boolean }) {
  const [error, dispatch] = useFormState(signInWithCredentials, undefined)

  useEffect(() => {
    if (error) toast.error(error.error)
  }, [error])

  return (
    <div className="flex min-h-96 w-full max-w-sm flex-col gap-8 place-self-center rounded-2xl bg-slate-900 p-8 shadow-lg">
      <div className="flex flex-col items-center justify-center gap-2">
        <Columns4 className="size-6 stroke-slate-200" />
        <span className="text-lg font-bold text-slate-200">
          Sign in to use Trellix
        </span>
      </div>

      <form
        autoComplete="off"
        className="flex w-full flex-col gap-2"
        action={dispatch}
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-200">Name</span>
          <input
            name="username"
            required
            className="rounded-full border-slate-700 bg-gray-800 py-2 px-4 text-sm text-slate-200"
            placeholder="John Doe"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-200">Pasword</span>
          <input
            name="password"
            required
            className="rounded-full border-slate-700 bg-gray-800 py-2 px-4 text-sm text-slate-200"
            placeholder="**********"
            type="password"
            minLength={6}
          />
        </label>

        <SubmitButton>Sign in</SubmitButton>
      </form>

      <div className="relative h-px w-full bg-slate-700">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-2 text-xs text-slate-500">
          or
        </span>
      </div>

      <form action={signInWithGithub}>
        <SubmitButton
          disabled={!props.githubEnabled}
          icon={<Github className="size-4" />}
        >
          Sign in with GitHub
        </SubmitButton>
      </form>
    </div>
  )
}
