import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    summary?: string;
    sufficiencyScore?: number;
    reason?: 'user' | 'assistant';
  };

  if (!body.projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const project = await projectStore.getProject(body.projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const nextScore = typeof body.sufficiencyScore === 'number' ? clamp(Math.round(body.sufficiencyScore), 0, 100) : 80;
  const summary = body.summary?.trim() || '访谈已结束，可进入大纲生成阶段。';

  const savedState = await projectStore.saveWorkflowState(body.projectId, {
    interviewSummary: summary,
    sufficiencyScore: nextScore
  });
  if (!savedState) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const updatedProject = await projectStore.updateProject(body.projectId, {
    status: 'OUTLINE_CANDIDATES'
  });
  if (!updatedProject) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      finished: true,
      recommended: nextScore >= 80,
      reason: body.reason || 'user',
      project: updatedProject
    }
  });
}
