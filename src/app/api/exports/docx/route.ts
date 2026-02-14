import { NextResponse } from 'next/server';
import { exportDocxBuffer } from '@/services/export/docx-exporter';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { projectTitle?: string; content?: string };
  const title = body.projectTitle?.trim();

  if (!title) {
    return NextResponse.json({ error: 'projectTitle is required' }, { status: 400 });
  }

  const fileName = `${title.replace(/[\\/:*?"<>|]/g, ' ').trim()}.docx`;
  const payload = exportDocxBuffer(title, body.content || '');

  return new NextResponse(payload, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Content-Length': payload.byteLength.toString()
    }
  });
}
