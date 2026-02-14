import type { OutlineInput } from '@/agents/outline/types';

export const assertOutlineInput = (input: OutlineInput) => {
  if (!input.projectTitle.trim()) {
    throw new Error('projectTitle is required');
  }

  if (!input.interviewSummary.trim()) {
    throw new Error('interviewSummary is required');
  }
};
