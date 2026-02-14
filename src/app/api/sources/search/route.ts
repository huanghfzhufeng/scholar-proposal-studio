import { NextResponse } from 'next/server';
import { RetrievalAgent } from '@/agents/retrieval';
import { mockDb } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    projectTitle?: string;
    outlineKeywords?: string[];
  };

  const agent = new RetrievalAgent();
  const output = agent.run({
    projectTitle: body.projectTitle || '未命名课题',
    outlineKeywords: body.outlineKeywords || []
  });

  if (body.projectId) {
    mockDb.retrievals.set(body.projectId, output);
  }

  return NextResponse.json({ data: output });
}
