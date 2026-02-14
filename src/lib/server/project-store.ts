import type { DraftOutput } from '@/agents/draft';
import type { InterviewOutput } from '@/agents/interview';
import type { OutlineOutput } from '@/agents/outline';
import type { RetrievalItem } from '@/agents/retrieval';
import {
  addManualRetrievalItem,
  getRetrievalItems,
  getWorkflowState,
  mockDb,
  nowIso,
  upsertProject,
  upsertRetrievalItems,
  upsertWorkflowState,
  updateRetrievalItem
} from '@/lib/server/mock-db';
import { prisma } from '@/lib/server/prisma';
import type { WorkflowStatePatch } from '@/shared/workflow-state';

export type ProjectRecord = {
  id: string;
  title: string;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStateRecord = {
  project: ProjectRecord;
  interview: InterviewOutput | null;
  outlines: OutlineOutput | null;
  lockedOutline: unknown;
  sources: RetrievalItem[];
  draft: DraftOutput | null;
  workflowState: WorkflowStatePatch | null;
};

type SourceSectionKey = '立项依据' | '研究内容' | '研究基础';

type ManualSourcePayload = {
  title: string;
  url: string;
  source: string;
  abstract: string;
  year: string;
  sectionKey: SourceSectionKey;
  score: number;
};

const isPrismaEnabled = () => {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  return process.env.USE_PRISMA_STORAGE !== 'false';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const toIso = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toISOString();
};

const toProjectRecord = (project: {
  id: string;
  title: string;
  status: string;
  deletedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): ProjectRecord => ({
  id: project.id,
  title: project.title,
  status: project.status,
  deletedAt: toIso(project.deletedAt),
  createdAt: toIso(project.createdAt) || nowIso(),
  updatedAt: toIso(project.updatedAt) || nowIso()
});

const toRetrievalItem = (source: {
  id: string;
  title: string;
  source: string;
  year: string;
  url: string;
  abstract: string;
  sectionKey: string;
  score: number;
  selected: boolean;
}): RetrievalItem => ({
  id: source.id,
  title: source.title,
  source: source.source,
  year: source.year,
  url: source.url,
  abstract: source.abstract,
  sectionKey: (source.sectionKey as RetrievalItem['sectionKey']) || '研究内容',
  score: source.score,
  selected: source.selected
});

const parseObjectJson = <T>(value: unknown): T | null => {
  return isPlainObject(value) ? (value as T) : null;
};

const mergeWorkflowPatch = (current: unknown, patch: WorkflowStatePatch): WorkflowStatePatch => {
  const existing = isPlainObject(current) ? (current as WorkflowStatePatch) : {};
  const sanitized = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as WorkflowStatePatch;
  return {
    ...existing,
    ...sanitized
  };
};

const withFallback = async <T>(prismaTask: () => Promise<T>, memoryTask: () => Promise<T> | T): Promise<T> => {
  if (!isPrismaEnabled()) {
    return Promise.resolve(memoryTask());
  }

  try {
    return await prismaTask();
  } catch {
    return Promise.resolve(memoryTask());
  }
};

const sortProjects = (items: ProjectRecord[]) => {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const projectStore = {
  async listProjectGroups() {
    return withFallback(
      async () => {
        const projects = await prisma.project.findMany({
          orderBy: {
            updatedAt: 'desc'
          }
        });
        const mapped = projects.map((item) => toProjectRecord(item));

        return {
          active: mapped.filter((item) => !item.deletedAt),
          archived: mapped.filter((item) => Boolean(item.deletedAt))
        };
      },
      () => {
        const mapped = Array.from(mockDb.projects.values()).map((item) => toProjectRecord(item));
        const sorted = sortProjects(mapped);
        return {
          active: sorted.filter((item) => !item.deletedAt),
          archived: sorted.filter((item) => Boolean(item.deletedAt))
        };
      }
    );
  },

  async createProject(title: string) {
    return withFallback(
      async () => {
        const created = await prisma.project.create({
          data: {
            title,
            status: 'INTERVIEW',
            deletedAt: null
          }
        });
        return toProjectRecord(created);
      },
      () => {
        const now = nowIso();
        const created = upsertProject({
          id: crypto.randomUUID(),
          title,
          status: 'INTERVIEW',
          deletedAt: null,
          createdAt: now,
          updatedAt: now
        });
        return toProjectRecord(created);
      }
    );
  },

  async getProject(projectId: string) {
    return withFallback(
      async () => {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        return project ? toProjectRecord(project) : null;
      },
      () => {
        const project = mockDb.projects.get(projectId);
        return project ? toProjectRecord(project) : null;
      }
    );
  },

  async updateProject(projectId: string, payload: { title?: string; status?: string; deletedAt?: string | null }) {
    return withFallback(
      async () => {
        const updated = await prisma.project.update({
          where: { id: projectId },
          data: {
            ...(payload.title !== undefined ? { title: payload.title } : {}),
            ...(payload.status !== undefined ? { status: payload.status } : {}),
            ...(payload.deletedAt !== undefined
              ? {
                  deletedAt: payload.deletedAt ? new Date(payload.deletedAt) : null
                }
              : {})
          }
        });
        return toProjectRecord(updated);
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return null;
        }

        const updated = upsertProject({
          ...existing,
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          ...(payload.deletedAt !== undefined ? { deletedAt: payload.deletedAt } : {}),
          updatedAt: nowIso()
        });

        return toProjectRecord(updated);
      }
    );
  },

  async getProjectState(projectId: string): Promise<ProjectStateRecord | null> {
    return withFallback(
      async () => {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            sources: {
              orderBy: [{ selected: 'desc' }, { score: 'desc' }, { updatedAt: 'desc' }]
            }
          }
        });

        if (!project) {
          return null;
        }

        return {
          project: toProjectRecord(project),
          interview: parseObjectJson<InterviewOutput>(project.interviewState),
          outlines: parseObjectJson<OutlineOutput>(project.outlinesState),
          lockedOutline: project.lockedOutline ?? null,
          sources: project.sources.map((item) => toRetrievalItem(item)),
          draft: parseObjectJson<DraftOutput>(project.draftState),
          workflowState: parseObjectJson<WorkflowStatePatch>(project.workflowState)
        };
      },
      () => {
        const project = mockDb.projects.get(projectId);
        if (!project) {
          return null;
        }

        return {
          project: toProjectRecord(project),
          interview: mockDb.interviews.get(projectId) || null,
          outlines: mockDb.outlines.get(projectId) || null,
          lockedOutline: mockDb.lockedOutlines.get(projectId) || null,
          sources: getRetrievalItems(projectId),
          draft: mockDb.drafts.get(projectId) || null,
          workflowState: getWorkflowState(projectId)
        };
      }
    );
  },

  async saveWorkflowState(projectId: string, patch: WorkflowStatePatch) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, workflowState: true, updatedAt: true }
        });
        if (!existing) {
          return null;
        }

        const updated = await prisma.project.update({
          where: { id: projectId },
          data: {
            workflowState: mergeWorkflowPatch(existing.workflowState, patch)
          },
          select: {
            updatedAt: true
          }
        });

        return {
          projectId,
          savedAt: updated.updatedAt.toISOString()
        };
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return null;
        }

        const saved = upsertWorkflowState(projectId, patch);
        upsertProject({
          ...existing,
          updatedAt: nowIso()
        });

        return {
          projectId,
          savedAt: saved.updatedAt
        };
      }
    );
  },

  async saveInterview(projectId: string, output: InterviewOutput, workflowPatch?: WorkflowStatePatch) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, workflowState: true }
        });
        if (!existing) {
          return false;
        }

        await prisma.project.update({
          where: { id: projectId },
          data: {
            interviewState: output,
            ...(workflowPatch ? { workflowState: mergeWorkflowPatch(existing.workflowState, workflowPatch) } : {})
          }
        });
        return true;
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return false;
        }

        mockDb.interviews.set(projectId, output);
        if (workflowPatch) {
          upsertWorkflowState(projectId, workflowPatch);
        }
        upsertProject({
          ...existing,
          updatedAt: nowIso()
        });
        return true;
      }
    );
  },

  async saveOutlines(projectId: string, output: OutlineOutput, workflowPatch?: WorkflowStatePatch) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, workflowState: true }
        });
        if (!existing) {
          return false;
        }

        await prisma.project.update({
          where: { id: projectId },
          data: {
            outlinesState: output,
            ...(workflowPatch ? { workflowState: mergeWorkflowPatch(existing.workflowState, workflowPatch) } : {})
          }
        });
        return true;
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return false;
        }

        mockDb.outlines.set(projectId, output);
        if (workflowPatch) {
          upsertWorkflowState(projectId, workflowPatch);
        }
        upsertProject({
          ...existing,
          updatedAt: nowIso()
        });
        return true;
      }
    );
  },

  async saveLockedOutline(projectId: string, outline: unknown) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true }
        });
        if (!existing) {
          return false;
        }

        await prisma.project.update({
          where: { id: projectId },
          data: {
            lockedOutline: isPlainObject(outline) || Array.isArray(outline) ? outline : { value: outline }
          }
        });
        return true;
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return false;
        }

        mockDb.lockedOutlines.set(projectId, outline);
        upsertProject({
          ...existing,
          updatedAt: nowIso()
        });
        return true;
      }
    );
  },

  async replaceSources(projectId: string, items: RetrievalItem[]) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true }
        });
        if (!existing) {
          return [];
        }

        await prisma.$transaction([
          prisma.source.deleteMany({
            where: {
              projectId
            }
          }),
          prisma.source.createMany({
            data: items.map((item) => ({
              id: item.id,
              projectId,
              title: item.title,
              source: item.source,
              year: item.year,
              url: item.url,
              abstract: item.abstract,
              sectionKey: item.sectionKey,
              score: item.score,
              selected: item.selected
            }))
          })
        ]);

        const sources = await prisma.source.findMany({
          where: { projectId },
          orderBy: [{ selected: 'desc' }, { score: 'desc' }, { updatedAt: 'desc' }]
        });
        return sources.map((item) => toRetrievalItem(item));
      },
      () => {
        return upsertRetrievalItems(projectId, items);
      }
    );
  },

  async listSources(projectId: string) {
    return withFallback(
      async () => {
        const sources = await prisma.source.findMany({
          where: { projectId },
          orderBy: [{ selected: 'desc' }, { score: 'desc' }, { updatedAt: 'desc' }]
        });
        return sources.map((item) => toRetrievalItem(item));
      },
      () => getRetrievalItems(projectId)
    );
  },

  async updateSourceSelection(projectId: string, sourceId: string, selected: boolean) {
    return withFallback(
      async () => {
        await prisma.source.updateMany({
          where: {
            projectId,
            id: sourceId
          },
          data: {
            selected
          }
        });

        const sources = await prisma.source.findMany({
          where: { projectId },
          orderBy: [{ selected: 'desc' }, { score: 'desc' }, { updatedAt: 'desc' }]
        });
        return sources.map((item) => toRetrievalItem(item));
      },
      () => updateRetrievalItem(projectId, sourceId, selected)
    );
  },

  async addManualSource(projectId: string, payload: ManualSourcePayload) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true }
        });
        if (!existing) {
          return null;
        }

        const created = await prisma.source.create({
          data: {
            id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            projectId,
            title: payload.title,
            url: payload.url,
            source: payload.source,
            abstract: payload.abstract,
            year: payload.year,
            sectionKey: payload.sectionKey,
            score: payload.score,
            selected: true
          }
        });

        return toRetrievalItem(created);
      },
      () => addManualRetrievalItem(projectId, payload)
    );
  },

  async listSelectedSources(projectId: string) {
    return withFallback(
      async () => {
        const sources = await prisma.source.findMany({
          where: {
            projectId,
            selected: true
          },
          orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }]
        });
        return sources.map((item) => toRetrievalItem(item));
      },
      () => getRetrievalItems(projectId).filter((item) => item.selected)
    );
  },

  async saveDraft(projectId: string, output: DraftOutput, workflowPatch?: WorkflowStatePatch) {
    return withFallback(
      async () => {
        const existing = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, workflowState: true }
        });
        if (!existing) {
          return false;
        }

        await prisma.project.update({
          where: { id: projectId },
          data: {
            draftState: output,
            ...(workflowPatch ? { workflowState: mergeWorkflowPatch(existing.workflowState, workflowPatch) } : {})
          }
        });

        return true;
      },
      () => {
        const existing = mockDb.projects.get(projectId);
        if (!existing) {
          return false;
        }

        mockDb.drafts.set(projectId, output);
        if (workflowPatch) {
          upsertWorkflowState(projectId, workflowPatch);
        }
        upsertProject({
          ...existing,
          updatedAt: nowIso()
        });
        return true;
      }
    );
  }
};
