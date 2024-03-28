import { relations } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'

export const User = sqliteTable('user', {
  id: int('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull(),
  name: text('name').notNull(),
  // email: text('email').notNull(),
  // hashedPassword: text('hashed_password').notNull(),
})

export const Board = sqliteTable(
  'board',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    publicId: text('public_id').notNull(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    ownerId: text('owner_id').notNull(),
  },
  (table) => ({
    ownerIdx: index('board_owner_idx').on(table.ownerId),
  }),
)
export const createBoardSchema = createInsertSchema(Board, {}).omit({
  id: true,
  ownerId: true,
  publicId: true,
})

export const Column = sqliteTable(
  'column',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    publicId: text('public_id').notNull(),
    name: text('name').notNull(),
    order: int('order').notNull(),
    boardId: text('board_id').notNull(),
  },
  (table) => ({
    boardIdx: index('column_board_idx').on(table.boardId),
  }),
)

export const Item = sqliteTable(
  'item',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    publicId: text('public_id').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    order: int('order').notNull(),
    columnId: text('column_id').notNull(),
    boardId: int('board_id').notNull(),
  },
  (table) => ({
    columnIdx: index('item_column_idx').on(table.columnId),
    boardIdx: index('item_board_idx').on(table.boardId),
  }),
)

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
  column: one(Column, { fields: [Item.id], references: [Column.id] }),
  board: one(Board, { fields: [Item.boardId], references: [Board.id] }),
}))
