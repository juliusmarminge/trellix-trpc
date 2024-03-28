import { customAlphabet } from 'nanoid'
import { faker } from '@faker-js/faker'
import { z } from 'zod'

const CONTENT_TYPE = 'application/remix-card'
const TransferSchema = z.object({ id: z.string(), title: z.string() })

export const isCardTransfer = (e: React.DragEvent) =>
  !!e.dataTransfer.types.includes(CONTENT_TYPE)

export const createTransfer = (
  dt: DataTransfer,
  data: z.infer<typeof TransferSchema>,
) => dt.setData(CONTENT_TYPE, JSON.stringify(data))

export const parseTransfer = (dt: DataTransfer) =>
  TransferSchema.parse(JSON.parse(dt.getData(CONTENT_TYPE)))

export function invariant<T>(
  condition: T,
  msg?: string | (() => string),
): asserts condition {
  if (condition) return

  const provided = typeof msg === 'function' ? msg() : msg
  const prefix = 'Invariant failed'
  const value = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

export function genId(pfx: string) {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
  return [pfx, nanoid()].join('_')
}

export function genRandomName() {
  return faker.animal.snake().replace(/\s/g, '-').toLowerCase()
}
