export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Label = 'bug' | 'feature' | 'improvement' | 'question';
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'urgent';

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  label: Label | null;
  created_at: string;
  updated_at: string;
  comments_count?: number;
}

export interface Comment {
  id: string;
  issue_id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  issue_id: string;
  summary: string;
  root_cause: string;
  suggestions: string[];
  sentiment: Sentiment;
  generated_at: string;
}

export interface IssueDetail extends Issue {
  comments_count: number;
  latest_analysis: AIAnalysis | null;
}

export interface IssueFilters {
  status?: Status;
  priority?: Priority;
  label?: Label;
  search?: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  priority?: Priority;
  label?: Label;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  label?: Label | null;
}

export interface CreateCommentInput {
  issue_id: string;
  content: string;
  author?: string;
}
