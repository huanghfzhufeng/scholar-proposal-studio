import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    sourceId?: string;
    selected?: boolean;
  };

  return NextResponse.json({ data: body });
}
