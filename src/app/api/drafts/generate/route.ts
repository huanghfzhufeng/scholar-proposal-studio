import { NextResponse } from 'next/server';
import { DraftAgent } from '@/agents/draft';
import { draftTools } from '@/agents/draft/tools';
import { projectStore } from '@/lib/server/project-store';

const sectionKeys: Array<'立项依据' | '研究内容' | '研究基础'> = ['立项依据', '研究内容', '研究基础'];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    title?: string;
    outlineText?: string;
    sourceText?: string;
    retryCount?: number;
    stream?: boolean;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const selectedItems = await projectStore.listSelectedSources(body.projectId);
  const sectionCountMap = sectionKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = selectedItems.filter((item) => item.sectionKey === key).length;
    return acc;
  }, {});

  const missingSections = sectionKeys.filter((key) => sectionCountMap[key] < 2);

  if (missingSections.length > 0) {
    return NextResponse.json(
      {
        error: 'INSUFFICIENT_CITATIONS',
        data: {
          missingSections,
          sectionCountMap,
          retryCount: body.retryCount ?? 0
        }
      },
      { status: 422 }
    );
  }

  // Stream mode
  if (body.stream) {
    const agent = new DraftAgent();
    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const gen = agent.runStream({
            title: body.title || '未命名课题',
            outlineText: body.outlineText || '待补充',
            sourceText: body.sourceText || '待补充'
          });

          for await (const event of gen) {
            if (event.type === 'delta') {
              fullText += event.data;
              controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: event.data })}\n\n`));
            } else if (event.type === 'done') {
              // Post-validation
              const allowedSourceIds = new Set(selectedItems.map((item) => item.id));
              const citationIds = draftTools.extractCitationIds(fullText);
              const unverifiedSourceIds = citationIds.filter((id) => !allowedSourceIds.has(id));

              const validationResult = {
                content: fullText,
                sectionCountMap,
                hasUnverified: unverifiedSourceIds.length > 0,
                unverifiedSourceIds
              };

              controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify(validationResult)}\n\n`));

              // Persist draft
              if (body.projectId) {
                await projectStore.saveDraft(body.projectId, { content: fullText }, {
                  draftContent: fullText,
                  hasGeneratedDraft: true
                });
              }
            }
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

  // Non-stream mode (kept for backward compatibility)
  const agent = new DraftAgent();
  const output = await agent.run({
    title: body.title || '未命名课题',
    outlineText: body.outlineText || '待补充',
    sourceText: body.sourceText || '待补充'
  });

  const allowedSourceIds = new Set(selectedItems.map((item) => item.id));
  const citationIds = draftTools.extractCitationIds(output.content);
  const unverifiedSourceIds = Array.from(new Set(citationIds.filter((id) => !allowedSourceIds.has(id))));

  if (unverifiedSourceIds.length > 0) {
    return NextResponse.json(
      {
        error: 'UNVERIFIED_CITATIONS',
        data: {
          unverifiedSourceIds
        }
      },
      { status: 422 }
    );
  }

  const missingInContent = draftTools.findSectionsWithInsufficientCitations(output.content, 2);
  if (missingInContent.length > 0) {
    return NextResponse.json(
      {
        error: 'INSUFFICIENT_CONTENT_CITATIONS',
        data: {
          missingSections: missingInContent
        }
      },
      { status: 422 }
    );
  }

  const saved = await projectStore.saveDraft(body.projectId, output, {
    draftContent: output.content,
    hasGeneratedDraft: true
  });
  if (!saved) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...output,
      sectionCountMap
    }
  });
}

