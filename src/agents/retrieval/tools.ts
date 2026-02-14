import type { RetrievalItem } from '@/agents/retrieval/types';

const blockedPatterns = ['content-farm', 'spam', 'ads'];

export const retrievalTools = {
  filterLowQuality(items: RetrievalItem[]) {
    return items.filter((item) => !blockedPatterns.some((pattern) => item.url.includes(pattern)));
  },
  sortByScore(items: RetrievalItem[]) {
    return [...items].sort((a, b) => b.score - a.score);
  }
};
