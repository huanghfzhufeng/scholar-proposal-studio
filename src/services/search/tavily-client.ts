export type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export class TavilyClient {
  constructor(private readonly apiKey: string) {}

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('Tavily API key is missing');
    }

    return [
      {
        title: `Tavily result for ${query}`,
        url: 'https://example.org/tavily',
        content: 'Mock content from Tavily.',
        score: 0.9
      }
    ];
  }
}
