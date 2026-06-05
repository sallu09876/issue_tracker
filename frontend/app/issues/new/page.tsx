'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import IssueForm, { IssueFormValues } from '@/components/IssueForm';
import { createIssue } from '@/lib/api';
import type { Label } from '@/types';

export default function NewIssuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: IssueFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const issue = await createIssue({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        label: values.label ? (values.label as Label) : undefined,
      });
      router.push(`/issues/${issue.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
      setIsLoading(false);
    }
  }

  function handleCancel() {
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Create New Issue</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-700/60 bg-slate-800 p-6">
        <IssueForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </div>
  );
}
