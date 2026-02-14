import { NextResponse } from 'next/server';
import { mockDb, nowIso, upsertProject } from '@/lib/server/mock-db';

export async function GET() {
  return NextResponse.json({
    data: Array.from(mockDb.projects.values())
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const title = body.title?.trim() || `未命名课题-${Date.now()}`;
  const now = nowIso();

  const project = upsertProject({
    id: crypto.randomUUID(),
    title,
    status: 'INTERVIEW',
    deletedAt: null,
    createdAt: now,
    updatedAt: now
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
