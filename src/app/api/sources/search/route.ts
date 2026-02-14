import { NextResponse } from 'next/server';
import { RetrievalAgent } from '@/agents/retrieval';
import { upsertRetrievalItems } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    projectTitle?: string;
    outlineKeywords?: string[];
  };

  const agent = new RetrievalAgent();
  const output = await agent.run({
    projectTitle: body.projectTitle || '未命名课题',
    outlineKeywords: body.outlineKeywords || []
  });

  if (body.projectId) {
    upsertRetrievalItems(body.projectId, output.items);
  }

  return NextResponse.json({ data: output });
}
