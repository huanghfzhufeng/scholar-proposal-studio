import { NextResponse } from 'next/server';
import { getWorkflowState, mockDb, nowIso, upsertProject, upsertWorkflowState } from '@/lib/server/mock-db';
import type { WorkflowStatePatch } from '@/shared/workflow-state';

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, context: Params) {
  const { id } = context.params;

  const project = mockDb.projects.get(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      project,
      interview: mockDb.interviews.get(id) || null,
      outlines: mockDb.outlines.get(id) || null,
      lockedOutline: mockDb.lockedOutlines.get(id) || null,
      sources: mockDb.retrievals.get(id)?.items || [],
      draft: mockDb.drafts.get(id) || null,
      workflowState: getWorkflowState(id)
    }
  });
}

export async function PATCH(request: Request, context: Params) {
  const { id } = context.params;
  const project = mockDb.projects.get(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    workflowState?: WorkflowStatePatch;
  };

  const workflowState = body.workflowState;

  if (!workflowState || typeof workflowState !== 'object' || Array.isArray(workflowState)) {
    return NextResponse.json({ error: 'workflowState is required' }, { status: 400 });
  }

  const saved = upsertWorkflowState(id, workflowState);

  upsertProject({
    ...project,
    updatedAt: nowIso()
  });

  return NextResponse.json({
    data: {
      projectId: id,
      savedAt: saved.updatedAt
    }
  });
}
