import { assertRetrievalInput } from '@/agents/retrieval/schema';
import { retrievalTools } from '@/agents/retrieval/tools';
import type { RetrievalInput, RetrievalOutput } from '@/agents/retrieval/types';

export class RetrievalAgent {
  run(input: RetrievalInput): RetrievalOutput {
    assertRetrievalInput(input);

    const sectionByIndex: Array<'立项依据' | '研究内容' | '研究基础'> = ['立项依据', '研究内容', '研究基础'];

    const mockItems = [
      {
        id: `src-${Date.now()}-1`,
        title: `${input.projectTitle} 领域综述`,
        url: 'https://example.org/review',
        source: 'Nature Reviews',
        abstract: '总结关键进展与问题。',
        year: '2024',
        sectionKey: sectionByIndex[0],
        score: 95,
        selected: true
      },
      {
        id: `src-${Date.now()}-2`,
        title: `${input.projectTitle} 方法学论文`,
        url: 'https://example.org/method',
        source: 'arXiv',
        abstract: '描述可复现的方法框架。',
        year: '2025',
        sectionKey: sectionByIndex[1],
        score: 91,
        selected: true
      },
      {
        id: `src-${Date.now()}-3`,
        title: `${input.projectTitle} 研究基础平台报告`,
        url: 'https://example.org/foundation',
        source: 'IEEE Xplore',
        abstract: '提供研究平台与前期积累说明。',
        year: '2023',
        sectionKey: sectionByIndex[2],
        score: 90,
        selected: true
      },
      {
        id: `src-${Date.now()}-4`,
        title: `${input.projectTitle} 理论问题演进`,
        url: 'https://example.org/theory',
        source: 'Science',
        abstract: '对核心科学问题进行理论演进分析。',
        year: '2022',
        sectionKey: sectionByIndex[0],
        score: 88,
        selected: false
      },
      {
        id: `src-${Date.now()}-5`,
        title: `${input.projectTitle} 交叉方法比较`,
        url: 'https://example.org/compare',
        source: 'Cell Systems',
        abstract: '比较多种技术路线并给出优缺点。',
        year: '2024',
        sectionKey: sectionByIndex[1],
        score: 87,
        selected: false
      },
      {
        id: `src-${Date.now()}-6`,
        title: `${input.projectTitle} 团队能力与基线评估`,
        url: 'https://example.org/baseline',
        source: 'PLOS ONE',
        abstract: '评估团队现有能力与可实施性边界。',
        year: '2021',
        sectionKey: sectionByIndex[2],
        score: 86,
        selected: false
      }
    ];

    return {
      items: retrievalTools.sortByScore(retrievalTools.filterLowQuality(mockItems))
    };
  }
}
