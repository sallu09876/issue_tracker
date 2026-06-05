'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import IssueForm, { IssueFormValues } from '@/components/IssueForm';
import { getIssue, updateIssue } from '@/lib/api';
import type { IssueDetail, Label } from '@/types';

export default function EditIssuePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getIssue(id);
      setIssue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issue');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  async function handleSubmit(values: IssueFormValues) {
    setIsSaving(true);
    setError(null);

    try {
      await updateIssue(id, {
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        label: values.label ? (values.label as Label) : null,
      });
      router.push(`/issues/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update issue');
      setIsSaving(false);
    }
  }

  function handleCancel() {
    router.push(`/issues/${id}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-slate-800" />
        <div className="h-64 rounded-xl bg-slate-800" />
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-12 text-center">
        <p className="mb-4 text-red-400">{error}</p>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to issues
        </Link>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/issues/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to issue
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-100">Edit Issue</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-700/60 bg-slate-800 p-6">
        <IssueForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
          isEditing
          initialValues={{
            title: issue.title,
            description: issue.description ?? '',
            priority: issue.priority,
            label: issue.label ?? '',
            status: issue.status,
          }}
        />
      </div>
    </div>
  );
}
