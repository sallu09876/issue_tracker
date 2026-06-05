'use client';

import type { Label, Priority, Status } from '@/types';

export type FilterStatus = Status | 'all';
export type FilterPriority = Priority | 'all';
export type FilterLabel = Label | 'all';

interface FilterBarProps {
  search: string;
  status: FilterStatus;
  priority: FilterPriority;
  label: FilterLabel;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: FilterStatus) => void;
  onPriorityChange: (value: FilterPriority) => void;
  onLabelChange: (value: FilterLabel) => void;
  onClear: () => void;
}

const selectClass =
  'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function FilterBar({
  search,
  status,
  priority,
  label,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onLabelChange,
  onClear,
}: FilterBarProps) {
  const hasActiveFilters =
    search !== '' || status !== 'all' || priority !== 'all' || label !== 'all';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="search"
        placeholder="Search issues..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:min-w-[200px] sm:flex-1"
      />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All Statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as FilterPriority)}
        className={selectClass}
        aria-label="Filter by priority"
      >
        <option value="all">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={label}
        onChange={(e) => onLabelChange(e.target.value as FilterLabel)}
        className={selectClass}
        aria-label="Filter by label"
      >
        <option value="all">All Labels</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature</option>
        <option value="improvement">Improvement</option>
        <option value="question">Question</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
