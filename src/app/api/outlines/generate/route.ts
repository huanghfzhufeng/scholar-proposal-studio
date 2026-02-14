import { NextResponse } from 'next/server';
import { OutlineAgent } from '@/agents/outline';
import { mockDb } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    projectTitle?: string;
    interviewSummary?: string;
  };

  const agent = new OutlineAgent();
  const output = await agent.run({
    projectTitle: body.projectTitle || '未命名课题',
    interviewSummary: body.interviewSummary || '待补充'
  });

  if (body.projectId) {
    mockDb.outlines.set(body.projectId, output);
  }

  return NextResponse.json({ data: output });
}
