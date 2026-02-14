import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';
import type { WorkflowStatePatch } from '@/shared/workflow-state';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;

  const state = await projectStore.getProjectState(id);
  if (!state) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      project: state.project,
      interview: state.interview,
      outlines: state.outlines,
      lockedOutline: state.lockedOutline,
      sources: state.sources,
      draft: state.draft,
      workflowState: state.workflowState
    }
  });
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;

  const body = (await request.json().catch(() => ({}))) as {
    workflowState?: WorkflowStatePatch;
  };

  const workflowState = body.workflowState;

  if (!workflowState || typeof workflowState !== 'object' || Array.isArray(workflowState)) {
    return NextResponse.json({ error: 'workflowState is required' }, { status: 400 });
  }

  const saved = await projectStore.saveWorkflowState(id, workflowState);
  if (!saved) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      projectId: saved.projectId,
      savedAt: saved.savedAt
    }
  });
}
