export type AppView =
  | 'landing'
  | 'dashboard'
  | 'interview'
  | 'outline'
  | 'sources'
  | 'generation'
  | 'editor'
  | 'reservoir';

export type ProjectStage = 'interview' | 'outline' | 'sources' | 'generation' | 'editor';

export type ProjectItem = {
  id: string;
  title: string;
  stage: ProjectStage;
  progress: number;
  lastEdit: string;
};

export type ArchivedProject = ProjectItem & {
  deletedAt: string;
};

export type InterviewMessage = {
  role: 'ai' | 'user';
  text: string;
};

export type OutlineSection = {
  id: number;
  title: string;
  subs: string[];
};

export type OutlineCandidate = {
  id: string;
  title: string;
  focus: string;
  fitScore: number;
  content: OutlineSection[];
};

export type OutlineVersion = {
  id: string;
  createdAt: string;
  label: string;
  outline: OutlineCandidate;
};

export type SourceItem = {
  id: string;
  title: string;
  source: string;
  year: string;
  url: string;
  abstract: string;
  sectionKey: '立项依据' | '研究内容' | '研究基础';
  score: number;
  selected: boolean;
};

export type GenerationStep = {
  key: string;
  title: string;
  status: 'idle' | 'running' | 'done';
};
