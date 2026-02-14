import { NextResponse } from 'next/server';
import { mockDb, nowIso, upsertProject } from '@/lib/server/mock-db';

type Params = {
  params: { id: string };
};

export async function POST(_request: Request, context: Params) {
  const { id } = context.params;
  const existing = mockDb.projects.get(id);

  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const updated = upsertProject({
    ...existing,
    deletedAt: null,
    updatedAt: nowIso()
  });

  return NextResponse.json({ data: updated });
}
