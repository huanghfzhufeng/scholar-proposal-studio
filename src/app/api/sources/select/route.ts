import { NextResponse } from 'next/server';
import { updateRetrievalItem } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    sourceId?: string;
    selected?: boolean;
  };

  if (!body.projectId || !body.sourceId) {
    return NextResponse.json({ error: 'projectId and sourceId are required' }, { status: 400 });
  }

  const selected = Boolean(body.selected);
  const items = updateRetrievalItem(body.projectId, body.sourceId, selected);

  return NextResponse.json({
    data: {
      projectId: body.projectId,
      sourceId: body.sourceId,
      selected,
      items
    }
  });
}
