import type { SearchResult } from '@/services/search/tavily-client';

export const rankAcademicFirst = (items: SearchResult[]) => {
  return [...items].sort((a, b) => b.score - a.score);
};
