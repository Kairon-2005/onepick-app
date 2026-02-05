import { pgTable, text, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// 7.1 OnePickSeason - 季度投票周期
export const onePickSeasons = pgTable('one_pick_seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "2026 Q1"
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('upcoming'), // upcoming / active / closed
});

// 7.2 OrderBinding - 订单号与匿名身份绑定
export const orderBindings = pgTable('order_bindings', {
  pid: uuid('pid').notNull().unique(), // 匿名身份（唯一）
  orderId: text('order_id').notNull().unique(), // 订单号（唯一）
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pidIdx: uniqueIndex('pid_idx').on(table.pid),
  orderIdIdx: uniqueIndex('order_id_idx').on(table.orderId),
}));

// 7.3 OnePickVote - 投票记录
export const onePickVotes = pgTable('one_pick_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id').notNull().references(() => onePickSeasons.id),
  orderId: text('order_id').notNull(),
  candidateId: text('candidate_id').notNull(), // 候选人 ID
  status: text('status').notNull().default('valid'), // valid / frozen / invalid
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // 一个订单号在一个季度只能有一个投票
  seasonOrderIdx: uniqueIndex('season_order_idx').on(table.seasonId, table.orderId),
}));

// 7.4 ChangeKey - 修改密钥（仅保留最新一条）
export const changeKeys = pgTable('change_keys', {
  orderId: text('order_id').notNull(),
  seasonId: uuid('season_id').notNull().references(() => onePickSeasons.id),
  keyHash: text('key_hash').notNull(), // bcrypt hash
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // 组合主键：一个订单号在一个季度只有一个有效密钥
  orderSeasonIdx: uniqueIndex('order_season_key_idx').on(table.orderId, table.seasonId),
}));

// 7.5 OnePickChangeLog - 修改日志
export const onePickChangeLogs = pgTable('one_pick_change_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pid: uuid('pid').notNull(),
  orderId: text('order_id').notNull(),
  seasonId: uuid('season_id').notNull().references(() => onePickSeasons.id),
  fromCandidateId: text('from_candidate_id').notNull(),
  toCandidateId: text('to_candidate_id').notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
});
