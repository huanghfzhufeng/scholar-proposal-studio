import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    outlineId?: string;
    outline?: unknown;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const saved = await projectStore.saveLockedOutline(body.projectId, body.outline || { outlineId: body.outlineId });
  if (!saved) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      projectId: body.projectId,
      outlineId: body.outlineId,
      locked: true
    }
  });
}
