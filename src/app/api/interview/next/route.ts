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
  const encoder = new TextEncoder();
  let fullText = '';
  let metaData = { sufficiencyScore: 0, summary: '' };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const gen = agent.runStream({
          projectTitle: body.projectTitle || '未命名课题',
          history: body.history || [],
          userAnswer: body.userAnswer
        });

        for await (const event of gen) {
          if (event.type === 'delta') {
            fullText += event.data;
            controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: event.data })}\n\n`));
          } else if (event.type === 'meta') {
            metaData = JSON.parse(event.data);
            controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify(metaData)}\n\n`));
          } else if (event.type === 'done') {
            controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ text: fullText })}\n\n`));
          }
        }

        // Persist after streaming is complete
        if (body.projectId && fullText) {
          const nextMessages: Array<{ role: 'ai' | 'user'; text: string }> = [
            ...(body.history || [])
              .filter((item) => item.role === 'assistant' || item.role === 'user')
              .map((item) => ({
                role: item.role === 'assistant' ? ('ai' as const) : ('user' as const),
                text: item.content
              })),
            { role: 'ai' as const, text: fullText }
          ];

          await projectStore.saveInterview(body.projectId, {
            nextQuestion: fullText,
            sufficiencyScore: metaData.sufficiencyScore,
            summary: metaData.summary
          }, {
            messages: nextMessages,
            sufficiencyScore: Math.round(metaData.sufficiencyScore * 100),
            interviewSummary: metaData.summary
          });
        }
      } catch {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}

