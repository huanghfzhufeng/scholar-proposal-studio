import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { projectId?: string; outlineId?: string };

  return NextResponse.json({
    data: {
      projectId: body.projectId,
      outlineId: body.outlineId,
      locked: true
    }
  });
}
