import type { InterviewInput } from '@/agents/interview/types';

export const assertInterviewInput = (input: InterviewInput) => {
  if (!input.projectTitle.trim()) {
    throw new Error('projectTitle is required');
  }

  if (!Array.isArray(input.history)) {
    throw new Error('history is required');
  }
};
