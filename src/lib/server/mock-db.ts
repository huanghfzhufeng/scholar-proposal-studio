import type { DraftOutput } from '@/agents/draft';
import type { InterviewOutput } from '@/agents/interview';
import type { OutlineOutput } from '@/agents/outline';
import type { RetrievalItem, RetrievalOutput } from '@/agents/retrieval';

type ProjectRecord = {
  id: string;
  title: string;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const projects = new Map<string, ProjectRecord>();
const outlines = new Map<string, OutlineOutput>();
const interviews = new Map<string, InterviewOutput>();
const retrievals = new Map<string, RetrievalOutput>();
const drafts = new Map<string, DraftOutput>();
const lockedOutlines = new Map<string, unknown>();

export const mockDb = {
  projects,
  outlines,
  lockedOutlines,
  interviews,
  retrievals,
  drafts
};

export const upsertProject = (project: ProjectRecord) => {
  projects.set(project.id, project);
  return project;
};

export const upsertRetrievalItems = (projectId: string, items: RetrievalItem[]) => {
  retrievals.set(projectId, { items });
  return items;
};

export const getRetrievalItems = (projectId: string) => {
  return retrievals.get(projectId)?.items || [];
};

export const updateRetrievalItem = (projectId: string, sourceId: string, selected: boolean) => {
  const items = getRetrievalItems(projectId).map((item) => (item.id === sourceId ? { ...item, selected } : item));
  retrievals.set(projectId, { items });
  return items;
};

export const addManualRetrievalItem = (projectId: string, payload: Omit<RetrievalItem, 'id' | 'selected'>) => {
  const item: RetrievalItem = {
    ...payload,
    id: `manual-${Date.now()}`,
    selected: true
  };
  const items = [item, ...getRetrievalItems(projectId)];
  retrievals.set(projectId, { items });
  return item;
};

export const nowIso = () => new Date().toISOString();
