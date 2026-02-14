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

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: 'advanced',
        max_results: 8
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily request failed: ${response.status}`);
    }

    const json = (await response.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        score?: number;
      }>;
    };

    return (json.results || []).map((item, idx) => ({
      title: item.title || `Tavily result ${idx + 1}`,
      url: item.url || '',
      content: item.content || '',
      score: item.score ?? 0.5
    }));
  }
}
