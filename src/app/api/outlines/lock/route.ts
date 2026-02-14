import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    outlineId?: string;
    outline?: unknown;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  mockDb.lockedOutlines.set(body.projectId, body.outline || { outlineId: body.outlineId });

  return NextResponse.json({
    data: {
      projectId: body.projectId,
      outlineId: body.outlineId,
      locked: true
    }
  });
}
