import type { BoardWithColumns } from '@/app/_data'
import type { ColumnType, ItemType } from '@/db/schema'
import { invariant } from '@/utils'
import { useOptimistic } from 'react'

interface AddCol {
  intent: 'add-col'
  id: string
  name: string
}
interface DelCol {
  intent: 'del-col'
  id: string
}
interface AddItm {
  intent: 'add-itm'
  id: string
  columnId: string
  title: string
  order: number
}
interface DelItm {
  intent: 'del-itm'
  id: string
  columnId: string
}
interface MoveItm {
  intent: 'move-itm'
  id: string
  toColumnId: string
  order: number
}

export const useOptimisticBoard = (board: BoardWithColumns) => {
  const [optBoard, optUpdate] = useOptimistic(
    { ...board },
    (state, action: AddCol | DelCol | AddItm | DelItm | MoveItm) => {
      switch (action.intent) {
        case 'add-col': {
          state.columns.push({
            boardId: board.id,
            id: action.id,
            order: Object.values(state.columns).length,
            name: action.name,
          })
          return state
        }
        case 'del-col': {
          state.columns = state.columns.filter((col) => col.id !== action.id)
          return state
        }
        case 'add-itm': {
          board.items[action.id] = {
            id: action.id,
            columnId: action.columnId,
            boardId: board.id,
            title: action.title,
            order: action.order,
            content: null,
          }
          return state
        }
        case 'del-itm': {
          delete board.items[action.id]
          return state
        }
        case 'move-itm': {
          const item = board.items[action.id]
          invariant(item)
          item.columnId = action.toColumnId
          item.order = action.order
          return state
        }
      }
    },
  )

  // Add items to columns
  const columns = new Map<string, ColumnType & { items: ItemType[] }>(
    optBoard.columns.map((col) => [col.id, { ...col, items: [] }]),
  )
  for (const item of Object.values(board.items)) {
    const column = columns.get(item.columnId)
    invariant(column, 'Column not found')
    column.items.push(item)
  }

  return { board: optBoard, columns, optUpdate }
}
