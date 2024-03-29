import type { InferSelectModel } from 'drizzle-orm'
import { relations } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const User = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  // email: text('email').notNull(),
  hashedPassword: text('hashed_password').notNull(),
})

export const Board = sqliteTable(
  'board',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    ownerId: text('owner_id').notNull(),
  },
  (table) => ({
    ownerIdx: index('board_owner_idx').on(table.ownerId),
  }),
)
export type BoardType = InferSelectModel<typeof Board>
export const createBoardSchema = createInsertSchema(Board, {
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
}).omit({
  id: true,
  ownerId: true,
})

export const Column = sqliteTable(
  'column',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    order: int('order').notNull(),
    boardId: text('board_id').notNull(),
  },
  (table) => ({
    boardIdx: index('column_board_idx').on(table.boardId),
  }),
)
export type ColumnType = InferSelectModel<typeof Column>
export const createColumnSchema = createInsertSchema(Column, {
  id: z.string().startsWith('col_'),
}).omit({
  order: true,
})

export const Item = sqliteTable(
  'item',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    order: int('order').notNull(),
    columnId: text('column_id').notNull(),
    boardId: text('board_id').notNull(),
  },
  (table) => ({
    columnIdx: index('item_column_idx').on(table.columnId),
    boardIdx: index('item_board_idx').on(table.boardId),
  }),
)
export type ItemType = InferSelectModel<typeof Item>
export const createItemSchema = createInsertSchema(Item, {
  id: z.string().startsWith('itm_'),
  order: z.coerce.number(),
}).omit({})

export const UserRelations = relations(User, ({ many }) => ({
  boards: many(Board),
}))

export const BoardRelations = relations(Board, ({ many, one }) => ({
  owner: one(User, { fields: [Board.ownerId], references: [User.id] }),
  columns: many(Column),
  items: many(Item),
}))

export const ColumnRelations = relations(Column, ({ many, one }) => ({
  board: one(Board, { fields: [Column.boardId], references: [Board.id] }),
  items: many(Item),
}))

export const ItemRelations = relations(Item, ({ one }) => ({
  column: one(Column, { fields: [Item.columnId], references: [Column.id] }),
  board: one(Board, { fields: [Item.boardId], references: [Board.id] }),
}))
