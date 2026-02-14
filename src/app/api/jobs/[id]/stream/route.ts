type Params = {
  params: { id: string };
};

export async function GET(_request: Request, context: Params) {
  const { id } = context.params;
  const encoder = new TextEncoder();
  const events = [
    { event: 'queued', data: { id, status: 'queued', message: '任务已入队' } },
    { event: 'running', data: { id, status: 'running', message: '正在执行生成任务' } },
    { event: 'step_done', data: { id, status: 'step_done', message: '已完成正文草稿生成' } },
    { event: 'completed', data: { id, status: 'completed', message: '任务执行完成' } }
  ];

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;

      const push = () => {
        const current = events[index];
        if (!current) {
          controller.close();
          return;
        }

        const chunk = `event: ${current.event}\ndata: ${JSON.stringify(current.data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        index += 1;

        if (index < events.length) {
          setTimeout(push, 350);
        } else {
          setTimeout(() => controller.close(), 150);
        }
      };

      push();
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
