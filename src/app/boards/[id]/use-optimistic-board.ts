import type { BoardWithColumns } from '@/app/_data'
import type { ColumnType, ItemType } from '@/db/schema'
import { invariant } from '@/utils'
import { useOptimistic } from 'react'

interface UpdCol {
  intent: 'updClr'
  color: string
}
interface AddCol {
  intent: 'addCol'
  id: string
  name: string
}
interface DelCol {
  intent: 'delCol'
  id: string
}
interface AddItm {
  intent: 'addItm'
  id: string
  columnId: string
  title: string
  order: number
}
interface DelItm {
  intent: 'delItm'
  id: string
  columnId: string
}
interface MoveItm {
  intent: 'moveItm'
  id: string
  toColumnId: string
  order: number
}

export const useOptimisticBoard = (board: BoardWithColumns) => {
  const [optimisticBoard, optimisticUpdate] = useOptimistic(
    { ...board },
    (state, action: UpdCol | AddCol | DelCol | AddItm | DelItm | MoveItm) => {
      switch (action.intent) {
        case 'updClr': {
          state.color = action.color
          return state
        }
        case 'addCol': {
          state.columns.push({
            boardId: board.id,
            id: action.id,
            order: Object.values(state.columns).length,
            name: action.name,
          })
          return state
        }
        case 'delCol': {
          state.columns = state.columns.filter((col) => col.id !== action.id)
          return state
        }
        case 'addItm': {
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
        case 'delItm': {
          delete board.items[action.id]
          return state
        }
        case 'moveItm': {
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
    optimisticBoard.columns.map((col) => [col.id, { ...col, items: [] }]),
  )
  for (const item of Object.values(board.items)) {
    const column = columns.get(item.columnId)
    column?.items.push(item)
  }

  return { board: optimisticBoard, columns, optimisticUpdate }
}
