import { Router } from 'express';
import { z } from 'zod';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import * as commentService from '../services/commentService';
import * as issueService from '../services/issueService';

const router = Router();

const createCommentSchema = z.object({
  issue_id: z.string().uuid('issue_id must be a valid UUID'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().max(100).optional(),
});

router.get(
  '/:issueId',
  asyncHandler(async (req, res) => {
    await issueService.getIssueById(req.params.issueId);
    const comments = await commentService.getCommentsByIssueId(req.params.issueId);
    res.json({ data: comments });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Validation failed', 400);
    }

    await issueService.getIssueById(parsed.data.issue_id);

    const comment = await commentService.createComment(parsed.data);
    res.status(201).json({ data: comment });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await commentService.deleteComment(req.params.id);
    res.json({ data: { success: true } });
  })
);

export default router;
