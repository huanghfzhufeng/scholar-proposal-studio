import { NextResponse } from 'next/server';
import { addManualRetrievalItem } from '@/lib/server/mock-db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    title?: string;
    url?: string;
    source?: string;
    abstract?: string;
    year?: string;
    sectionKey?: '立项依据' | '研究内容' | '研究基础';
    score?: number;
  };

  if (!body.projectId || !body.title || !body.url) {
    return NextResponse.json({ error: 'projectId, title, url are required' }, { status: 400 });
  }

  const item = addManualRetrievalItem(body.projectId, {
    title: body.title,
    url: body.url,
    source: body.source || 'Manual Entry',
    abstract: body.abstract || '手动补充的资料条目。',
    year: body.year || new Date().getFullYear().toString(),
    sectionKey: body.sectionKey || '研究内容',
    score: body.score ?? 80
  });

  return NextResponse.json({ data: item }, { status: 201 });
}
