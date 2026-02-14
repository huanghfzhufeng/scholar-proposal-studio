import { NextResponse } from 'next/server';
import { mockDb, nowIso, upsertProject } from '@/lib/server/mock-db';

type Params = {
  params: { id: string };
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = context.params;
  const existing = mockDb.projects.get(id);

  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const updated = upsertProject({
    ...existing,
    deletedAt: nowIso(),
    updatedAt: nowIso()
  });

  return NextResponse.json({ data: updated });
}

export async function PATCH(request: Request, context: Params) {
  const { id } = context.params;
  const existing = mockDb.projects.get(id);

  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    status?: string;
  };

  const updated = upsertProject({
    ...existing,
    title: body.title?.trim() || existing.title,
    status: body.status || existing.status,
    updatedAt: nowIso()
  });

  return NextResponse.json({ data: updated });
}
