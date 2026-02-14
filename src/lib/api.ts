import type { SourceItem } from '@/components/mvp/types';
import type { WorkflowStatePatch } from '@/shared/workflow-state';

type ApiResponse<T> = {
  data: T;
  error?: string;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  const json = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    const message = typeof json?.error === 'string' ? json.error : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return json.data;
};

export type ApiProject = {
  id: string;
  title: string;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  listProjects: () =>
    request<{ active: ApiProject[]; archived: ApiProject[] }>('/api/projects', {
      method: 'GET'
    }),

  createProject: (title: string) =>
    request<ApiProject>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title })
    }),

  deleteProject: (projectId: string) =>
    request<ApiProject>(`/api/projects/${projectId}`, {
      method: 'DELETE'
    }),

  updateProject: (projectId: string, payload: { title?: string; status?: string }) =>
    request<ApiProject>(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  restoreProject: (projectId: string) =>
    request<ApiProject>(`/api/projects/${projectId}/restore`, {
      method: 'POST'
    }),

  getProjectState: (projectId: string) =>
    request<{
      project: ApiProject;
      interview: {
        nextQuestion: string;
        sufficiencyScore: number;
        summary: string;
      } | null;
      outlines: {
        candidates: Array<{
          label: string;
          focus: string;
          sections: Array<{ title: string; children: string[] }>;
        }>;
      } | null;
      lockedOutline: unknown;
      sources: SourceItem[];
      draft: { content: string } | null;
      workflowState: WorkflowStatePatch | null;
    }>(`/api/projects/${projectId}/state`, {
      method: 'GET'
    }),

  saveProjectState: (projectId: string, workflowState: WorkflowStatePatch) =>
    request<{ projectId: string; savedAt: string }>(`/api/projects/${projectId}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ workflowState })
    }),

  interviewNext: (payload: {
    projectId: string;
    projectTitle: string;
    history: Array<{ role: 'system' | 'assistant' | 'user'; content: string }>;
    userAnswer?: string;
  }) =>
    request<{ nextQuestion: string; sufficiencyScore: number; summary: string }>('/api/interview/next', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  generateOutlines: (payload: {
    projectId: string;
    projectTitle: string;
    interviewSummary: string;
  }) =>
    request<{
      candidates: Array<{
        label: string;
        focus: string;
        sections: Array<{ title: string; children: string[] }>;
      }>;
    }>('/api/outlines/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  lockOutline: (payload: {
    projectId: string;
    outlineId: string;
    outline: unknown;
  }) =>
    request<{ projectId: string; outlineId: string; locked: boolean }>('/api/outlines/lock', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  searchSources: (payload: {
    projectId: string;
    projectTitle: string;
    outlineKeywords: string[];
  }) =>
    request<{ items: SourceItem[] }>('/api/sources/search', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  selectSource: (payload: {
    projectId: string;
    sourceId: string;
    selected: boolean;
  }) =>
    request<{ projectId: string; sourceId: string; selected: boolean; items: SourceItem[] }>('/api/sources/select', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  addSource: (payload: {
    projectId: string;
    title: string;
    url: string;
    source: string;
    abstract: string;
    year: string;
    sectionKey: '立项依据' | '研究内容' | '研究基础';
    score?: number;
  }) =>
    request<SourceItem>('/api/sources/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  generateDraft: (payload: {
    projectId: string;
    title: string;
    outlineText: string;
    sourceText: string;
    retryCount: number;
  }) =>
    fetch('/api/drafts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
};
