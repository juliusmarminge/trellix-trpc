'use client'

import { Spinner } from '@radix-ui/themes'
import { useFormStatus } from 'react-dom'
import { twMerge } from 'tailwind-merge'

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  children: React.ReactNode
  type?: never
}

export function SubmitButton(props: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      className={twMerge(
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 py-2 px-4 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:pointer-events-none disabled:opacity-50',
        props.className,
      )}
      disabled={props.disabled === true || pending}
    >
      {props.icon ? (
        <>
          <Spinner loading={pending} size="2">
            {props.icon}
          </Spinner>
          {typeof props.children === 'string' ? (
            <span>{props.children}</span>
          ) : (
            props.children
          )}
        </>
      ) : (
        <Spinner loading={pending} size="2">
          {props.children}
        </Spinner>
      )}
    </button>
  )
}
