import type { SearchResult } from '@/services/search/tavily-client';

export const bingAdapter = {
  async search(_query: string): Promise<SearchResult[]> {
    return [];
  }
};
