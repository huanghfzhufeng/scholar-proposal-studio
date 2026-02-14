type SectionKey = '立项依据' | '研究内容' | '研究基础';

export type DraftSourceItem = {
  id: string;
  title: string;
  source: string;
  year: string;
  url: string;
  abstract: string;
  sectionKey: SectionKey;
  score: number;
  selected: boolean;
};

const SECTION_ORDER: Array<{ key: SectionKey; heading: string; intro: string }> = [
  {
    key: '立项依据',
    heading: '一、立项依据',
    intro: '本课题围绕关键科学问题展开，聚焦当前研究缺口与理论价值。'
  },
  {
    key: '研究内容',
    heading: '二、研究内容',
    intro: '围绕研究目标设计任务拆解、技术路线与阶段性验证方案。'
  },
  {
    key: '研究基础',
    heading: '三、研究基础',
    intro: '课题组已具备前期成果、平台条件和协作基础，可支撑项目实施。'
  }
];

const parseSourceItems = (sourceText: string): DraftSourceItem[] => {
  try {
    const parsed = JSON.parse(sourceText) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const source = item as Partial<DraftSourceItem>;
        if (
          typeof source.id !== 'string' ||
          typeof source.title !== 'string' ||
          typeof source.sectionKey !== 'string' ||
          !['立项依据', '研究内容', '研究基础'].includes(source.sectionKey)
        ) {
          return null;
        }

        return {
          id: source.id,
          title: source.title,
          source: typeof source.source === 'string' ? source.source : '未知来源',
          year: typeof source.year === 'string' ? source.year : '',
          url: typeof source.url === 'string' ? source.url : '',
          abstract: typeof source.abstract === 'string' ? source.abstract : '',
          sectionKey: source.sectionKey as SectionKey,
          score: typeof source.score === 'number' ? source.score : 0,
          selected: Boolean(source.selected)
        };
      })
      .filter((item): item is DraftSourceItem => Boolean(item));
  } catch {
    return [];
  }
};

const buildSectionParagraph = (intro: string, sources: DraftSourceItem[]) => {
  const selected = sources.slice(0, 3);
  const citationRefs = selected.map((item) => `[[${item.id}]]`).join(' ');
  const evidence = selected.map((item) => `${item.title}（${item.source}，${item.year || 'N/A'}）`).join('；');
  return `${intro} 结合已有证据 ${evidence}，形成可执行的研究假设与验证路径。${citationRefs}`.trim();
};

const buildGroundedDraft = (title: string, sourceText: string) => {
  const sources = parseSourceItems(sourceText).filter((item) => item.selected);
  const grouped = SECTION_ORDER.reduce<Record<SectionKey, DraftSourceItem[]>>(
    (acc, item) => {
      acc[item.key] = sources.filter((source) => source.sectionKey === item.key);
      return acc;
    },
    {
      立项依据: [],
      研究内容: [],
      研究基础: []
    }
  );

  const sections = SECTION_ORDER.map((section) => {
    const candidates = grouped[section.key];
    return `${section.heading}\n${buildSectionParagraph(section.intro, candidates)}`;
  });

  return `${title}\n\n${sections.join('\n\n')}`.trim();
};

const extractCitationIds = (content: string) => {
  const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
  return matches.map((token) => token.replace('[[', '').replace(']]', '').trim()).filter(Boolean);
};

const findSectionsWithInsufficientCitations = (content: string, minimum: number) => {
  const patterns: Array<{ key: SectionKey; pattern: RegExp }> = [
    {
      key: '立项依据',
      pattern: /一、立项依据([\s\S]*?)(?:\n二、研究内容|$)/
    },
    {
      key: '研究内容',
      pattern: /二、研究内容([\s\S]*?)(?:\n三、研究基础|$)/
    },
    {
      key: '研究基础',
      pattern: /三、研究基础([\s\S]*?)$/
    }
  ];

  return patterns
    .filter(({ pattern }) => {
      const text = content.match(pattern)?.[1] || '';
      const uniqueCitations = new Set(extractCitationIds(text));
      return uniqueCitations.size < minimum;
    })
    .map((item) => item.key);
};

export const draftTools = {
  normalizeParagraphs(content: string) {
    return content.replace(/\n{3,}/g, '\n\n').trim();
  },

  parseSources(sourceText: string) {
    return parseSourceItems(sourceText);
  },

  buildGroundedDraft(title: string, sourceText: string) {
    return buildGroundedDraft(title, sourceText);
  },

  extractCitationIds(content: string) {
    return extractCitationIds(content);
  },

  findSectionsWithInsufficientCitations(content: string, minimum = 2) {
    return findSectionsWithInsufficientCitations(content, minimum);
  }
};
