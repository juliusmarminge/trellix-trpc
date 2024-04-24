'use client'

import { signInWithCredentials, signInWithGithub } from '@/app/_actions'
import { Columns4, Github } from 'lucide-react'
import { signIn } from 'next-auth/webauthn'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import { SubmitButton } from './submit-button'

const PasskeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 327 318"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Passkey</title>
    <circle cx="126" cy="75" r="75" />
    <path d="M1 265.5V308.5H217.5V216.5C206.425 208.008 200.794 201.073 192 184C180.063 178.025 173.246 176.622 161 175.5H91.5C45.1022 186.909 19.4472 194.075 1 265.5Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M268 208C300.585 208 327 181.585 327 149C327 116.415 300.585 90 268 90C235.415 90 209 116.415 209 149C209 181.585 235.415 208 268 208ZM268 149C276.837 149 284 141.837 284 133C284 124.163 276.837 117 268 117C259.163 117 252 124.163 252 133C252 141.837 259.163 149 268 149Z"
    />
    <path d="M242.5 292V203H289L309 225.5L284.5 250.5L309 275.5L267 316.5L242.5 292Z" />
  </svg>
)

export function SignInForm(props: { githubEnabled: boolean }) {
  const [error, dispatch] = useFormState(signInWithCredentials, undefined)

  useEffect(() => {
    if (error) toast.error(error.error)
  }, [error])

  const [_, dispatchPasskey] = useFormState(async () => {
    try {
      await signIn('passkey')
    } catch {
      toast.error('Failed to sign in with passkey')
    }
  }, undefined)

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

      <div className="flex flex-col gap-2">
        <form action={signInWithGithub}>
          <SubmitButton
            disabled={!props.githubEnabled}
            icon={<Github className="size-4" />}
          >
            Sign in with GitHub
          </SubmitButton>
        </form>

        <form action={dispatchPasskey}>
          <SubmitButton>
            <PasskeyIcon className="size-4" />
            Sign in with Passkey
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

export function AddPassKey() {
  const [_, dispatch] = useFormState(async () => {
    try {
      await signIn('passkey', { action: 'register' })
    } catch {
      toast.error('Failed to register passkey')
    }
  }, undefined)

  return (
    <form action={dispatch}>
      <SubmitButton>
        <PasskeyIcon className="size-4" />
        Add Passkey
      </SubmitButton>
    </form>
  )
}
