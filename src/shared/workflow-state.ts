export type InterviewMessageSnapshot = {
  role: 'ai' | 'user';
  text: string;
};

export type OutlineSectionSnapshot = {
  id: number;
  title: string;
  subs: string[];
};

export type OutlineCandidateSnapshot = {
  id: string;
  title: string;
  focus: string;
  fitScore: number;
  content: OutlineSectionSnapshot[];
};

export type OutlineVersionSnapshot = {
  id: string;
  createdAt: string;
  label: string;
  outline: OutlineCandidateSnapshot;
};

export type GenerationStepSnapshot = {
  key: string;
  title: string;
  status: 'idle' | 'running' | 'done';
};

export type WorkflowStateSnapshot = {
  messages: InterviewMessageSnapshot[];
  sufficiencyScore: number;
  interviewSummary: string;
  outlineCandidates: OutlineCandidateSnapshot[];
  activeOutlineIndex: number;
  outlineVersions: OutlineVersionSnapshot[];
  generationSteps: GenerationStepSnapshot[];
  hasGeneratedDraft: boolean;
  draftContent: string;
};

export type WorkflowStatePatch = Partial<WorkflowStateSnapshot>;
