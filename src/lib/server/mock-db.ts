import type { DraftOutput } from '@/agents/draft';
import type { InterviewOutput } from '@/agents/interview';
import type { OutlineOutput } from '@/agents/outline';
import type { RetrievalOutput } from '@/agents/retrieval';

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

export const mockDb = {
  projects,
  outlines,
  interviews,
  retrievals,
  drafts
};

export const upsertProject = (project: ProjectRecord) => {
  projects.set(project.id, project);
  return project;
};

export const nowIso = () => new Date().toISOString();
