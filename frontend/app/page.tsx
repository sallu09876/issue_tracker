'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import FilterBar, { FilterLabel, FilterPriority, FilterStatus } from '@/components/FilterBar';
import IssueList from '@/components/IssueList';
import { getIssues } from '@/lib/api';
import type { Issue, IssueFilters } from '@/types';

function IssueCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-700/60 bg-slate-800 p-5">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-700" />
        <div className="h-5 w-20 rounded-full bg-slate-700" />
      </div>
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-700" />
      <div className="mb-1 h-4 w-full rounded bg-slate-700/70" />
      <div className="mb-4 h-4 w-2/3 rounded bg-slate-700/70" />
      <div className="h-3 w-24 rounded bg-slate-700/50" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
        <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-slate-300">No issues found</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">
        No issues found. Create your first issue.
      </p>
      <Link
        href="/issues/new"
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        Create Issue
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [priority, setPriority] = useState<FilterPriority>('all');
  const [label, setLabel] = useState<FilterLabel>('all');

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: IssueFilters = {};
    if (status !== 'all') filters.status = status;
    if (priority !== 'all') filters.priority = priority;
    if (label !== 'all') filters.label = label;
    if (search.trim()) filters.search = search.trim();

    try {
      const data = await getIssues(filters);
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, priority, label]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  function handleClearFilters() {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setLabel('all');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Issues</h1>
          {!isLoading && (
            <p className="mt-1 text-sm text-slate-500">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </p>
          )}
        </div>
      </div>

      <FilterBar
        search={search}
        status={status}
        priority={priority}
        label={label}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onLabelChange={setLabel}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <IssueCardSkeleton key={i} />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState />
      ) : (
        <IssueList issues={issues} />
      )}
    </div>
  );
}
