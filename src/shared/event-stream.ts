export type WorkflowEvent = {
  type: 'queued' | 'running' | 'step_done' | 'failed' | 'completed';
  message: string;
  traceId: string;
};

export const buildEvent = (event: WorkflowEvent) => {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
};
