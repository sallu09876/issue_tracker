import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const issueStatuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
export const issuePriorities = ['low', 'medium', 'high', 'critical'] as const;
export const issueLabels = ['bug', 'feature', 'improvement', 'question'] as const;
export const sentiments = ['positive', 'neutral', 'negative', 'urgent'] as const;

export type IssueStatus = (typeof issueStatuses)[number];
export type IssuePriority = (typeof issuePriorities)[number];
export type IssueLabel = (typeof issueLabels)[number];
export type Sentiment = (typeof sentiments)[number];

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  label: varchar('label', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id')
    .notNull()
    .references(() => issues.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  author: varchar('author', { length: 100 }).notNull().default('Anonymous'),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
});

export const aiAnalyses = pgTable('ai_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id')
    .notNull()
    .references(() => issues.id, { onDelete: 'cascade' }),
  summary: text('summary'),
  rootCause: text('root_cause'),
  suggestions: text('suggestions'),
  sentiment: varchar('sentiment', { length: 50 }),
  generatedAt: timestamp('generated_at', { withTimezone: false }).defaultNow().notNull(),
});

export const issuesRelations = relations(issues, ({ many }) => ({
  comments: many(comments),
  aiAnalyses: many(aiAnalyses),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, {
    fields: [comments.issueId],
    references: [issues.id],
  }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  issue: one(issues, {
    fields: [aiAnalyses.issueId],
    references: [issues.id],
  }),
}));
