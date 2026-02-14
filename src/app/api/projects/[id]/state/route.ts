import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/server/mock-db';

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
      draft: mockDb.drafts.get(id) || null
    }
  });
}
