import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/server/project-store';

export async function GET() {
  const groups = await projectStore.listProjectGroups();

  return NextResponse.json({
    data: {
      active: groups.active,
      archived: groups.archived
    }
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const title = body.title?.trim() || `未命名课题-${Date.now()}`;
  const project = await projectStore.createProject(title);

  return NextResponse.json({ data: project }, { status: 201 });
}
