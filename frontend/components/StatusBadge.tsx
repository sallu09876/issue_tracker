import type { Status } from '@/types';

const statusConfig: Record<Status, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
  },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}
