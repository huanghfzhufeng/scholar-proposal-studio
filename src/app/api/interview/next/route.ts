import { NextResponse } from 'next/server';
import { InterviewAgent } from '@/agents/interview';
import { mockDb } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    projectTitle?: string;
    history?: Array<{ role: 'system' | 'assistant' | 'user'; content: string }>;
    userAnswer?: string;
  };

  const agent = new InterviewAgent();
  const output = await agent.run({
    projectTitle: body.projectTitle || '未命名课题',
    history: body.history || [],
    userAnswer: body.userAnswer
  });

  if (body.projectId) {
    mockDb.interviews.set(body.projectId, output);
  }

  return NextResponse.json({ data: output });
}
