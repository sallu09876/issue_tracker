import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { aiAnalyses, comments, issues } from '../db/schema';
import type { IssueLabel, IssuePriority, IssueStatus } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  label?: IssueLabel;
  search?: string;
}

export interface IssueResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  label: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueDetailResponse extends IssueResponse {
  comments_count: number;
  latest_analysis: AIAnalysisResponse | null;
}

export interface AIAnalysisResponse {
  id: string;
  issue_id: string;
  summary: string | null;
  root_cause: string | null;
  suggestions: string[];
  sentiment: string | null;
  generated_at: string;
}

function mapIssue(issue: typeof issues.$inferSelect): IssueResponse {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    label: issue.label,
    created_at: issue.createdAt.toISOString(),
    updated_at: issue.updatedAt.toISOString(),
  };
}

function mapAnalysis(analysis: typeof aiAnalyses.$inferSelect): AIAnalysisResponse {
  let suggestions: string[] = [];

  if (analysis.suggestions) {
    try {
      const parsed = JSON.parse(analysis.suggestions) as unknown;
      suggestions = Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      suggestions = [];
    }
  }

  return {
    id: analysis.id,
    issue_id: analysis.issueId,
    summary: analysis.summary,
    root_cause: analysis.rootCause,
    suggestions,
    sentiment: analysis.sentiment,
    generated_at: analysis.generatedAt.toISOString(),
  };
}

export async function getIssues(filters: IssueFilters = {}): Promise<IssueResponse[]> {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(issues.status, filters.status));
  }

  if (filters.priority) {
    conditions.push(eq(issues.priority, filters.priority));
  }

  if (filters.label) {
    conditions.push(eq(issues.label, filters.label));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(issues.title, term), ilike(issues.description, term)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select()
    .from(issues)
    .where(whereClause)
    .orderBy(desc(issues.createdAt));

  return result.map(mapIssue);
}

export async function getIssueById(id: string): Promise<IssueDetailResponse> {
  const [issue] = await db.select().from(issues).where(eq(issues.id, id)).limit(1);

  if (!issue) {
    throw new AppError('Issue not found', 404);
  }

  const [commentCount] = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.issueId, id));

  const [latestAnalysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.issueId, id))
    .orderBy(desc(aiAnalyses.generatedAt))
    .limit(1);

  return {
    ...mapIssue(issue),
    comments_count: commentCount?.value ?? 0,
    latest_analysis: latestAnalysis ? mapAnalysis(latestAnalysis) : null,
  };
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  priority?: IssuePriority;
  label?: IssueLabel;
}

export async function createIssue(input: CreateIssueInput): Promise<IssueResponse> {
  const [issue] = await db
    .insert(issues)
    .values({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      label: input.label ?? null,
    })
    .returning();

  return mapIssue(issue);
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  label?: IssueLabel | null;
}

export async function updateIssue(id: string, input: UpdateIssueInput): Promise<IssueResponse> {
  const [existing] = await db.select().from(issues).where(eq(issues.id, id)).limit(1);

  if (!existing) {
    throw new AppError('Issue not found', 404);
  }

  const [issue] = await db
    .update(issues)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, id))
    .returning();

  return mapIssue(issue);
}

export async function deleteIssue(id: string): Promise<void> {
  const [deleted] = await db.delete(issues).where(eq(issues.id, id)).returning();

  if (!deleted) {
    throw new AppError('Issue not found', 404);
  }
}
