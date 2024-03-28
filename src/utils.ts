import { customAlphabet } from 'nanoid'
import { faker } from '@faker-js/faker'

export const CONTENT_TYPES = {
  card: 'application/remix-card',
  column: 'application/remix-column',
}
export interface Transfer {
  id?: string
  title?: string
}

const pfx = 'Invariant failed'
export function invariant<T>(
  condition: T,
  msg?: string | (() => string),
): asserts condition {
  if (condition) return

  const provided = typeof msg === 'function' ? msg() : msg
  const value = provided ? `${pfx}: ${provided}` : pfx
  throw new Error(value)
}

export function genId(pfx: string) {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
  return [pfx, nanoid()].join('_')
}

export function genRandomName() {
  return faker.animal.snake().replace(/\s/g, '-').toLowerCase()
}
