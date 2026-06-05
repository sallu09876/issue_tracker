'use client';

import { useState } from 'react';
import { generateAnalysis } from '@/lib/api';
import type { AIAnalysis, Sentiment } from '@/types';

function timeAgo(dateString: string): string {
  const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const sentimentConfig: Record<Sentiment, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-500/15 text-red-400 ring-red-500/30' },
  negative: { label: 'Negative', className: 'bg-orange-500/15 text-orange-400 ring-orange-500/30' },
  neutral: { label: 'Neutral', className: 'bg-slate-500/15 text-slate-400 ring-slate-500/30' },
  positive: { label: 'Positive', className: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' },
};

interface AIAnalysisPanelProps {
  issueId: string;
  initialAnalysis: AIAnalysis | null;
}

export default function AIAnalysisPanel({ issueId, initialAnalysis }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateAnalysis(issueId);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">AI Analysis</h2>
            <p className="text-xs text-slate-500">Powered by Google Gemini</p>
          </div>
        </div>

        {!analysis && !isLoading && (
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Generate AI Analysis
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-indigo-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Gemini is analyzing...
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-20 rounded-lg bg-slate-700/50" />
            <div className="h-16 rounded-lg bg-slate-700/50" />
            <div className="h-24 rounded-lg bg-slate-700/50" />
          </div>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${sentimentConfig[analysis.sentiment].className}`}
            >
              {sentimentConfig[analysis.sentiment].label}
            </span>
            <span className="text-xs text-slate-500">
              Last analyzed {timeAgo(analysis.generated_at)}
            </span>
          </div>

          <div className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Summary
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">{analysis.summary}</p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500/80">
              Root Cause
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">{analysis.root_cause}</p>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400/80">
              Suggestions
            </h3>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-slate-700/50 hover:text-indigo-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </button>
        </div>
      )}

      {!analysis && !isLoading && !error && (
        <p className="text-sm text-slate-500">
          No analysis yet. Click the button above to get AI-powered insights on this issue.
        </p>
      )}
    </div>
  );
}
