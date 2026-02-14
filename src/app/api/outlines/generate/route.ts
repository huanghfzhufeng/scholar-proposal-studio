import { NextResponse } from 'next/server';
import { OutlineAgent } from '@/agents/outline';
import { projectStore } from '@/lib/server/project-store';

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
    const timestamp = Date.now();
    await projectStore.saveOutlines(body.projectId, output, {
      outlineCandidates: output.candidates.map((candidate, idx) => ({
        id: `candidate-${timestamp}-${idx}`,
        title: candidate.label,
        focus: candidate.focus,
        fitScore: 88 + ((idx + 3) % 9),
        content: candidate.sections.map((section, sectionIdx) => ({
          id: sectionIdx + 1,
          title: section.title,
          subs: [...section.children]
        }))
      })),
      activeOutlineIndex: 0
    });
  }

  return NextResponse.json({ data: output });
}
