import { Router } from 'express';
import { z } from 'zod';
import { issueLabels, issuePriorities, issueStatuses } from '../db/schema';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import * as issueService from '../services/issueService';

const router = Router();

const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.enum(issuePriorities).optional(),
  label: z.enum(issueLabels).optional(),
});

const updateIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  status: z.enum(issueStatuses).optional(),
  priority: z.enum(issuePriorities).optional(),
  label: z.enum(issueLabels).nullable().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, priority, label, search } = req.query;

    const filters: issueService.IssueFilters = {};

    if (status) {
      if (!issueStatuses.includes(status as (typeof issueStatuses)[number])) {
        throw new AppError('Invalid status filter', 400);
      }
      filters.status = status as (typeof issueStatuses)[number];
    }

    if (priority) {
      if (!issuePriorities.includes(priority as (typeof issuePriorities)[number])) {
        throw new AppError('Invalid priority filter', 400);
      }
      filters.priority = priority as (typeof issuePriorities)[number];
    }

    if (label) {
      if (!issueLabels.includes(label as (typeof issueLabels)[number])) {
        throw new AppError('Invalid label filter', 400);
      }
      filters.label = label as (typeof issueLabels)[number];
    }

    if (search && typeof search === 'string') {
      filters.search = search;
    }

    const issues = await issueService.getIssues(filters);
    res.json({ data: issues });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const issue = await issueService.getIssueById(req.params.id);
    res.json({ data: issue });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createIssueSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Validation failed', 400);
    }

    const issue = await issueService.createIssue(parsed.data);
    res.status(201).json({ data: issue });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateIssueSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Validation failed', 400);
    }

    const issue = await issueService.updateIssue(req.params.id, parsed.data);
    res.json({ data: issue });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await issueService.deleteIssue(req.params.id);
    res.json({ data: { success: true } });
  })
);

export default router;
