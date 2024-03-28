import 'client-only'

import { useOptimistic, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export function EditableText(props: {
  onSubmit: (str: string) => void
  children: React.ReactNode
  fieldName: string
  value: string
  inputClassName: string
  inputLabel: string
  buttonClassName: string
  buttonLabel: string
}) {
  const [value, updateValue] = useOptimistic(
    props.value,
    (_, next: string) => next,
  )
  const [edit, setEdit] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const submit = (form: HTMLFormElement | FormData) => {
    const fd = form instanceof FormData ? form : new FormData(form)
    const value = fd.get(props.fieldName) as string
    if (value && value !== props.value) {
      props.onSubmit(value)
      updateValue(value)
    }
    flushSync(() => setEdit(false))
    buttonRef.current?.focus()
  }

  return edit ? (
    <form action={submit} className="w-full">
      {props.children}
      <input
        required
        ref={inputRef}
        type="text"
        aria-label={props.inputLabel}
        name={props.fieldName}
        defaultValue={value}
        className={props.inputClassName}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            flushSync(() => setEdit(false))
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
      aria-label={props.buttonLabel}
      type="button"
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true)
        })
        inputRef.current?.select()
      }}
      className={props.buttonClassName}
    >
      {value || <span className="italic text-slate-400">Edit</span>}
    </button>
  )
}
