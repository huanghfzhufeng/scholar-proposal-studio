import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { projectTitle?: string };
  const title = body.projectTitle?.trim() || `未命名课题-${Date.now()}`;

  return NextResponse.json({
    data: {
      fileName: `${title}.docx`,
      downloadUrl: `/downloads/${encodeURIComponent(title)}.docx`
    }
  });
}
