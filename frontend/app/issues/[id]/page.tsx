'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import CommentSection from '@/components/CommentSection';
import PriorityBadge from '@/components/PriorityBadge';
import StatusBadge from '@/components/StatusBadge';
import { deleteIssue, getComments, getIssue } from '@/lib/api';
import type { Comment, IssueDetail } from '@/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function labelClass(label: string): string {
  const classes: Record<string, string> = {
    bug: 'bg-red-500/10 text-red-400',
    feature: 'bg-indigo-500/10 text-indigo-400',
    improvement: 'bg-purple-500/10 text-purple-400',
    question: 'bg-cyan-500/10 text-cyan-400',
  };
  return classes[label] ?? 'bg-slate-700 text-slate-300';
}

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [issueData, commentsData] = await Promise.all([getIssue(id), getComments(id)]);
      setIssue(issueData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issue');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!issue) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${issue.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteIssue(id);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete issue');
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800/70" />
        <div className="h-4 w-3/4 rounded bg-slate-800/70" />
        <div className="h-40 rounded-xl bg-slate-800" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-12 text-center">
        <p className="mb-4 text-red-400">{error || 'Issue not found'}</p>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to issues
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to issues
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              {issue.label && (
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${labelClass(issue.label)}`}
                >
                  {issue.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">{issue.title}</h1>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href={`/issues/${issue.id}/edit`}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800 p-6">
        {issue.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {issue.description}
          </p>
        ) : (
          <p className="text-sm italic text-slate-500">No description provided.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-700/60 pt-4 text-xs text-slate-500">
          <span>Created {formatDate(issue.created_at)}</span>
          <span>Updated {formatDate(issue.updated_at)}</span>
          <span>
            {issue.comments_count} {issue.comments_count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      <AIAnalysisPanel issueId={issue.id} initialAnalysis={issue.latest_analysis} />

      <CommentSection issueId={issue.id} initialComments={comments} />
    </div>
  );
}
