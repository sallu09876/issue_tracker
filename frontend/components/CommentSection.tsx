'use client';

import { FormEvent, useState } from 'react';
import { createComment } from '@/lib/api';
import type { Comment } from '@/types';

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface CommentSectionProps {
  issueId: string;
  initialComments: Comment[];
}

export default function CommentSection({ issueId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const comment = await createComment({
        issue_id: issueId,
        content: content.trim(),
        author: author.trim() || undefined,
      });
      setComments((prev) => [...prev, comment]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">
        Comments
        <span className="ml-2 text-sm font-normal text-slate-500">({comments.length})</span>
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-slate-500">No comments yet. Be the first to comment.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-slate-700/60 bg-slate-800/50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{comment.author}</span>
                <span className="text-xs text-slate-500">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-800 p-4">
        <h3 className="text-sm font-medium text-slate-300">Add a comment</h3>

        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          className={inputClass}
          disabled={isSubmitting}
        />

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className={inputClass}
          disabled={isSubmitting}
          required
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
}
