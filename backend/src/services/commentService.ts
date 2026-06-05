import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { comments } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export interface CommentResponse {
  id: string;
  issue_id: string;
  content: string;
  author: string;
  created_at: string;
}

function mapComment(comment: typeof comments.$inferSelect): CommentResponse {
  return {
    id: comment.id,
    issue_id: comment.issueId,
    content: comment.content,
    author: comment.author,
    created_at: comment.createdAt.toISOString(),
  };
}

export async function getCommentsByIssueId(issueId: string): Promise<CommentResponse[]> {
  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.issueId, issueId))
    .orderBy(asc(comments.createdAt));

  return result.map(mapComment);
}

export interface CreateCommentInput {
  issue_id: string;
  content: string;
  author?: string;
}

export async function createComment(input: CreateCommentInput): Promise<CommentResponse> {
  const [comment] = await db
    .insert(comments)
    .values({
      issueId: input.issue_id,
      content: input.content,
      author: input.author ?? 'Anonymous',
    })
    .returning();

  return mapComment(comment);
}

export async function deleteComment(id: string): Promise<void> {
  const [deleted] = await db.delete(comments).where(eq(comments.id, id)).returning();

  if (!deleted) {
    throw new AppError('Comment not found', 404);
  }
}
