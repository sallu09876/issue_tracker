import type { Priority } from '@/types';

const priorityConfig: Record<Priority, { label: string; dotClass: string }> = {
  critical: { label: 'Critical', dotClass: 'bg-red-500' },
  high: { label: 'High', dotClass: 'bg-orange-500' },
  medium: { label: 'Medium', dotClass: 'bg-yellow-500' },
  low: { label: 'Low', dotClass: 'bg-slate-400' },
};

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
