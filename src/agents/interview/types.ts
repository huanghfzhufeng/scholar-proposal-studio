export type InterviewMessage = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

export type InterviewInput = {
  projectTitle: string;
  history: InterviewMessage[];
  userAnswer?: string;
};

export type InterviewOutput = {
  nextQuestion: string;
  sufficiencyScore: number;
  summary: string;
};
