import type { SearchResult } from '@/services/search/tavily-client';

const blockedKeywords = ['content-farm', 'spam', 'ads'];

export const filterLowQualitySources = (items: SearchResult[]) => {
  return items.filter((item) => !blockedKeywords.some((token) => item.url.includes(token)));
};
