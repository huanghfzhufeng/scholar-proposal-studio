import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const updated = await projectStore.updateProject(id, {
    deletedAt: new Date().toISOString()
  });

  if (!updated) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    status?: string;
  };
  const normalizedTitle = typeof body.title === 'string' ? body.title.trim() : undefined;

  const updated = await projectStore.updateProject(id, {
    title: normalizedTitle || undefined,
    status: body.status
  });

  if (!updated) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}
