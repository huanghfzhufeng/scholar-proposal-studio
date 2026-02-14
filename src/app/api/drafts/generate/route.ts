import { NextResponse } from 'next/server';
import { DraftAgent } from '@/agents/draft';
import { mockDb } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    title?: string;
    outlineText?: string;
    sourceText?: string;
  };

  const agent = new DraftAgent();
  const output = agent.run({
    title: body.title || '未命名课题',
    outlineText: body.outlineText || '待补充',
    sourceText: body.sourceText || '待补充'
  });

  if (body.projectId) {
    mockDb.drafts.set(body.projectId, output);
  }

  return NextResponse.json({ data: output });
}
