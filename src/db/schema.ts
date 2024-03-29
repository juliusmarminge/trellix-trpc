import type { InferSelectModel } from 'drizzle-orm'
import { relations } from 'drizzle-orm'
import {
  index,
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const User = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  hashedPassword: text('hashedPassword'),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
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
    order: integer('order').notNull(),
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
    order: integer('order').notNull(),
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
  accounts: many(Account),
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

/** NextAuth */
import type { AdapterAccount } from 'next-auth/adapters'

export const Account = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}))
