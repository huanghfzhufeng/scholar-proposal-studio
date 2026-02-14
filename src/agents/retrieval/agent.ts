import { assertRetrievalInput } from '@/agents/retrieval/schema';
import { retrievalTools } from '@/agents/retrieval/tools';
import type { RetrievalInput, RetrievalOutput } from '@/agents/retrieval/types';

export class RetrievalAgent {
  run(input: RetrievalInput): RetrievalOutput {
    assertRetrievalInput(input);

    const mockItems = [
      {
        title: `${input.projectTitle} 领域综述`,
        url: 'https://example.org/review',
        source: 'Nature Reviews',
        abstract: '总结关键进展与问题。',
        score: 95
      },
      {
        title: `${input.projectTitle} 方法学论文`,
        url: 'https://example.org/method',
        source: 'arXiv',
        abstract: '描述可复现的方法框架。',
        score: 91
      }
    ];

    return {
      items: retrievalTools.sortByScore(retrievalTools.filterLowQuality(mockItems))
    };
  }
}
