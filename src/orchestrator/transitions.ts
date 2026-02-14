export type WorkflowState =
  | 'INTERVIEW'
  | 'OUTLINE_CANDIDATES'
  | 'OUTLINE_LOCKED'
  | 'SOURCES_READY'
  | 'DRAFT_READY'
  | 'EXPORTABLE';

export const workflowTransitions: Record<WorkflowState, WorkflowState[]> = {
  INTERVIEW: ['OUTLINE_CANDIDATES'],
  OUTLINE_CANDIDATES: ['OUTLINE_LOCKED'],
  OUTLINE_LOCKED: ['SOURCES_READY'],
  SOURCES_READY: ['DRAFT_READY'],
  DRAFT_READY: ['EXPORTABLE'],
  EXPORTABLE: []
};
