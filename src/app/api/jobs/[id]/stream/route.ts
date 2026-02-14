import { NextResponse } from 'next/server';

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, context: Params) {
  const { id } = context.params;

  return NextResponse.json({
    data: {
      id,
      events: ['queued', 'running', 'step_done', 'completed']
    }
  });
}
