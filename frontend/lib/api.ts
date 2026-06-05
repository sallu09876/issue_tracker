import type {
  AIAnalysis,
  Comment,
  CreateCommentInput,
  CreateIssueInput,
  Issue,
  IssueDetail,
  IssueFilters,
  UpdateIssueInput,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiSuccessResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  error: string;
  status?: number;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    throw new ApiError(errorBody.error || 'Request failed', response.status);
  }

  return (body as ApiSuccessResponse<T>).data;
}

function buildQueryString(filters?: IssueFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.label) params.set('label', filters.label);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getIssues(filters?: IssueFilters): Promise<Issue[]> {
  return request<Issue[]>(`/issues${buildQueryString(filters)}`);
}

export async function getIssue(id: string): Promise<IssueDetail> {
  return request<IssueDetail>(`/issues/${id}`);
}

export async function createIssue(data: CreateIssueInput): Promise<Issue> {
  return request<Issue>('/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIssue(id: string, data: UpdateIssueInput): Promise<Issue> {
  return request<Issue>(`/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteIssue(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/issues/${id}`, {
    method: 'DELETE',
  });
}

export async function getComments(issueId: string): Promise<Comment[]> {
  return request<Comment[]>(`/comments/${issueId}`);
}

export async function createComment(data: CreateCommentInput): Promise<Comment> {
  return request<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/comments/${id}`, {
    method: 'DELETE',
  });
}

export async function getAnalysis(issueId: string): Promise<AIAnalysis | null> {
  return request<AIAnalysis | null>(`/analysis/${issueId}`);
}

export async function generateAnalysis(issueId: string): Promise<AIAnalysis> {
  return request<AIAnalysis>(`/analysis/generate/${issueId}`, {
    method: 'POST',
  });
}

export { ApiError };
