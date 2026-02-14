import { NextResponse } from 'next/server';
import { InterviewAgent } from '@/agents/interview';
import { mockDb, upsertWorkflowState } from '@/lib/server/mock-db';

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

    const nextMessages = [
      ...(body.history || [])
        .filter((item) => item.role === 'assistant' || item.role === 'user')
        .map((item) => ({
          role: item.role === 'assistant' ? 'ai' : 'user',
          text: item.content
        })),
      { role: 'ai' as const, text: output.nextQuestion }
    ];

    upsertWorkflowState(body.projectId, {
      messages: nextMessages,
      sufficiencyScore: Math.round(output.sufficiencyScore * 100),
      interviewSummary: output.summary
    });
  }

  return NextResponse.json({ data: output });
}
