'use client';

import { FormEvent, useState } from 'react';
import type { Priority, Status } from '@/types';

export interface IssueFormValues {
  title: string;
  description: string;
  priority: Priority;
  label: string;
  status: Status;
}

interface IssueFormProps {
  onSubmit: (values: IssueFormValues) => void | Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<IssueFormValues>;
  isLoading?: boolean;
  isEditing?: boolean;
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';

export default function IssueForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  isEditing = false,
}: IssueFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'medium');
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [status, setStatus] = useState<Status>(initialValues?.status ?? 'open');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      label,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Brief summary of the issue"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Detailed description of the issue..."
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className={labelClass}>
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputClass}
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="label" className={labelClass}>
            Label
          </label>
          <select
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          >
            <option value="">None</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
            <option value="question">Question</option>
          </select>
        </div>
      </div>

      {isEditing && (
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={inputClass}
            disabled={isLoading}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Issue' : 'Create Issue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
