import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// PRDs table
export const prds = pgTable('prds', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  sections: jsonb('sections'),
  status: varchar('status', { length: 50 }).default('draft'),
  template: varchar('template', { length: 50 }).default('standard'),
  githubRepo: varchar('github_repo', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  metadata: jsonb('metadata'),
}, (table) => ({
  createdAtIdx: index('idx_prds_created_at').on(table.createdAt),
  statusIdx: index('idx_prds_status').on(table.status),
  createdByIdx: index('idx_prds_created_by').on(table.createdBy),
}));

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  prdId: uuid('prd_id').references(() => prds.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata'),
}, (table) => ({
  prdIdIdx: index('idx_conversations_prd_id').on(table.prdId),
  timestampIdx: index('idx_conversations_timestamp').on(table.timestamp),
}));

