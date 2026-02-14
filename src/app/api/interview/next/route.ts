import { NextResponse } from 'next/server';
import { InterviewAgent } from '@/agents/interview';
import { projectStore } from '@/lib/server/project-store';

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
    const nextMessages: Array<{ role: 'ai' | 'user'; text: string }> = [
      ...(body.history || [])
        .filter((item) => item.role === 'assistant' || item.role === 'user')
        .map((item) => ({
          role: item.role === 'assistant' ? ('ai' as const) : ('user' as const),
          text: item.content
        })),
      { role: 'ai' as const, text: output.nextQuestion }
    ];

    await projectStore.saveInterview(body.projectId, output, {
      messages: nextMessages,
      sufficiencyScore: Math.round(output.sufficiencyScore * 100),
      interviewSummary: output.summary
    });
  }

  return NextResponse.json({ data: output });
}
