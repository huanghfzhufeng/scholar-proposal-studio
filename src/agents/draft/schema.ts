import type { DraftInput } from '@/agents/draft/types';

export const assertDraftInput = (input: DraftInput) => {
  if (!input.title.trim()) {
    throw new Error('title is required');
  }

  if (!input.outlineText.trim()) {
    throw new Error('outlineText is required');
  }
};
