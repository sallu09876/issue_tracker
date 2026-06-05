import { GoogleGenerativeAI } from '@google/generative-ai';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { aiAnalyses } from '../db/schema';
import type { Sentiment } from '../db/schema';
import { AppError } from '../middleware/errorHandler';
import type { CommentResponse } from './commentService';
import type { IssueResponse } from './issueService';

export interface AnalysisResult {
  summary: string;
  root_cause: string;
  suggestions: string[];
  sentiment: Sentiment;
}

export interface AnalysisResponse {
  id: string;
  issue_id: string;
  summary: string | null;
  root_cause: string | null;
  suggestions: string[];
  sentiment: string | null;
  generated_at: string;
}

function mapAnalysis(analysis: typeof aiAnalyses.$inferSelect): AnalysisResponse {
  let suggestions: string[] = [];

  if (analysis.suggestions) {
    try {
      const parsed = JSON.parse(analysis.suggestions) as unknown;
      suggestions = Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      suggestions = [];
    }
  }

  return {
    id: analysis.id,
    issue_id: analysis.issueId,
    summary: analysis.summary,
    root_cause: analysis.rootCause,
    suggestions,
    sentiment: analysis.sentiment,
    generated_at: analysis.generatedAt.toISOString(),
  };
}

function buildPrompt(issue: IssueResponse, comments: CommentResponse[]): string {
  const formattedComments =
    comments.length > 0
      ? comments.map((c) => `${c.author}: ${c.content}`).join('\n')
      : 'No comments yet.';

  return `You are an expert software engineering assistant analyzing a project issue.
Issue Title: ${issue.title}
Issue Description: ${issue.description ?? 'No description provided'}
Priority: ${issue.priority}
Status: ${issue.status}
Discussion (${comments.length} comments):
${formattedComments}
Please analyze this issue and respond in the following JSON format only:
{
  "summary": "2-3 sentence summary of the issue",
  "root_cause": "Your assessment of the likely root cause",
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "sentiment": "positive | neutral | negative | urgent"
}`;
}

function extractJson(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new AppError('Failed to parse AI response', 502);
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    summary?: string;
    root_cause?: string;
    suggestions?: string[];
    sentiment?: string;
  };

  if (!parsed.summary || !parsed.root_cause || !Array.isArray(parsed.suggestions) || !parsed.sentiment) {
    throw new AppError('AI response missing required fields', 502);
  }

  const validSentiments = ['positive', 'neutral', 'negative', 'urgent'] as const;
  if (!validSentiments.includes(parsed.sentiment as Sentiment)) {
    throw new AppError('AI response contained invalid sentiment', 502);
  }

  return {
    summary: parsed.summary,
    root_cause: parsed.root_cause,
    suggestions: parsed.suggestions,
    sentiment: parsed.sentiment as Sentiment,
  };
}

export async function generateIssueAnalysis(
  issue: IssueResponse,
  issueComments: CommentResponse[]
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured', 500);
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      // generationConfig: {
      //   responseMimeType: 'application/json',
      // },
    });
    const prompt = buildPrompt(issue, issueComments);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return extractJson(text);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'AI analysis failed';
    throw new AppError(message, 502);
  }
}

export async function saveAnalysis(
  issueId: string,
  analysis: AnalysisResult
): Promise<AnalysisResponse> {
  const [saved] = await db
    .insert(aiAnalyses)
    .values({
      issueId,
      summary: analysis.summary,
      rootCause: analysis.root_cause,
      suggestions: JSON.stringify(analysis.suggestions),
      sentiment: analysis.sentiment,
    })
    .returning();

  return mapAnalysis(saved);
}

export async function getLatestAnalysis(issueId: string): Promise<AnalysisResponse | null> {
  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.issueId, issueId))
    .orderBy(desc(aiAnalyses.generatedAt))
    .limit(1);

  return analysis ? mapAnalysis(analysis) : null;
}
