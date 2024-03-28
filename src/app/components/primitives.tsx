'use client'
import { forwardRef, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useUpdateMutation } from './queries.ts'
import { updateSchema } from './mocks/db.ts'

export const SaveButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      // this makes it so the button takes focus on clicks in safari I can't
      // remember if this is the proper workaround or not, it's been a while!
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
      // https://bugs.webkit.org/show_bug.cgi?id=22261
      tabIndex={0}
      {...props}
      className="bg-brand-blue rounded-lg p-2 text-left text-sm font-medium text-white"
    />
  )
})

export const CancelButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={0}
      {...props}
      className="rounded-lg p-2 text-left text-sm font-medium hover:bg-slate-200 focus:bg-slate-200"
    />
  )
})

export function EditableText({
  children,
  fieldName,
  value,
  inputClassName,
  inputLabel,
  buttonClassName,
  buttonLabel,
}: {
  children: React.ReactNode
  fieldName: string
  value: string
  inputClassName: string
  inputLabel: string
  buttonClassName: string
  buttonLabel: string
}) {
  const { mutate, status, variables } = useUpdateMutation()
  const [edit, setEdit] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // optimistic update
  if (status === 'pending') {
    value = variables.name
  }

  const submit = (form: HTMLFormElement) => {
    const formData = new FormData(form)
    mutate(updateSchema.parse(Object.fromEntries(formData.entries())))
  }

  return edit ? (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        submit(event.currentTarget)

        flushSync(() => {
          setEdit(false)
        })
        buttonRef.current?.focus()
      }}
    >
      {children}
      <input
        required
        ref={inputRef}
        type="text"
        aria-label={inputLabel}
        name={fieldName}
        defaultValue={value}
        className={inputClassName}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            flushSync(() => {
              setEdit(false)
            })
            buttonRef.current?.focus()
          }
        }}
        onBlur={(event) => {
          if (
            inputRef.current?.value !== value &&
            inputRef.current?.value.trim() !== ''
          ) {
            submit(event.currentTarget.form!)
          }
          setEdit(false)
        }}
      />
    </form>
  ) : (
    <button
      aria-label={buttonLabel}
      type="button"
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true)
        })
        inputRef.current?.select()
      }}
      className={buttonClassName}
    >
      {value || <span className="italic text-slate-400">Edit</span>}
    </button>
  )
}
