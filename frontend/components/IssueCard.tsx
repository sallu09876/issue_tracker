import Link from 'next/link';
import type { Issue } from '@/types';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className="group block rounded-xl border border-slate-700/60 bg-slate-800 p-5 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
    >
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

      <h3 className="mb-2 text-base font-semibold text-slate-100 transition-colors group-hover:text-indigo-400">
        {issue.title}
      </h3>

      {issue.description && (
        <p className="mb-4 line-clamp-2 text-sm text-slate-400">{issue.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{formatDate(issue.created_at)}</span>
        {issue.comments_count !== undefined && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {issue.comments_count} {issue.comments_count === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>
    </Link>
  );
}
