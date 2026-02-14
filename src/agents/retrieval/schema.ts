import type { RetrievalInput } from '@/agents/retrieval/types';

export const assertRetrievalInput = (input: RetrievalInput) => {
  if (!input.projectTitle.trim()) {
    throw new Error('projectTitle is required');
  }

  if (!Array.isArray(input.outlineKeywords)) {
    throw new Error('outlineKeywords must be an array');
  }
};
