import type { SearchResult } from '@/services/search/tavily-client';

export const serpApiAdapter = {
  async search(_query: string): Promise<SearchResult[]> {
    return [];
  }
};
