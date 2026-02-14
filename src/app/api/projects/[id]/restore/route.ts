import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Params) {
  const { id } = await context.params;
  const updated = await projectStore.updateProject(id, {
    deletedAt: null
  });

  if (!updated) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}
