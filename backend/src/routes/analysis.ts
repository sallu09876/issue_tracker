import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as aiService from '../services/aiService';
import * as commentService from '../services/commentService';
import * as issueService from '../services/issueService';

const router = Router();

router.get(
  '/:issueId',
  asyncHandler(async (req, res) => {
    await issueService.getIssueById(req.params.issueId);
    const analysis = await aiService.getLatestAnalysis(req.params.issueId);
    res.json({ data: analysis });
  })
);

router.post(
  '/generate/:issueId',
  asyncHandler(async (req, res) => {
    const issue = await issueService.getIssueById(req.params.issueId);
    const comments = await commentService.getCommentsByIssueId(req.params.issueId);

    const result = await aiService.generateIssueAnalysis(issue, comments);
    const saved = await aiService.saveAnalysis(req.params.issueId, result);

    res.status(201).json({ data: saved });
  })
);

export default router;
