import type {
  InterviewMessage,
  OutlineCandidate,
  OutlineSection,
  ProjectItem,
  SourceItem
} from '@/components/mvp/types';

export const initialProjects: ProjectItem[] = [
  {
    id: 1,
    title: '基于深度学习的蛋白质结构预测研究',
    stage: 'editor',
    progress: 88,
    lastEdit: '2小时前'
  },
  {
    id: 2,
    title: '新型纳米材料在光催化中的应用机制',
    stage: 'outline',
    progress: 42,
    lastEdit: '1天前'
  },
  {
    id: 3,
    title: '城市复杂交通流的多模态感知建模',
    stage: 'interview',
    progress: 16,
    lastEdit: '3天前'
  }
];

export const initialInterviewMessages: InterviewMessage[] = [
  {
    role: 'ai',
    text:
      '您好，我是访谈智能体。为了贴合 2026 国自然结构，请先描述本课题拟解决的核心科学问题。'
  }
];

export const interviewQuestionBank = [
  '这个问题的理论或临床价值是什么？请补充本课题的研究意义。',
  '您计划提出的核心创新点是什么？可以说 1-3 条最重要的。',
  '在研究内容层面，您打算设置哪几个关键任务？',
  '您现有的研究基础有哪些？例如前期论文、预实验或平台条件。',
  '您的技术路线准备如何展开？请给出关键方法与阶段目标。',
  '预期成果是什么？包括理论贡献、方法产出或应用价值。',
  '还有哪些风险点需要提前说明？例如样本、技术或时间风险。'
];

const createSection = (id: number, title: string, subs: string[]): OutlineSection => ({
  id,
  title,
  subs
});

const outlineTemplates: Omit<OutlineCandidate, 'id' | 'fitScore'>[] = [
  {
    title: '方案 A：强调机制创新',
    focus: 'Innovation',
    content: [
      createSection(1, '一、立项依据', ['1.1 科学问题定义', '1.2 国内外研究现状与不足']),
      createSection(2, '二、研究内容', ['2.1 关键机制解析', '2.2 验证实验设计']),
      createSection(3, '三、研究基础', ['3.1 前期研究积累', '3.2 研究平台与团队能力'])
    ]
  },
  {
    title: '方案 B：强调转化价值',
    focus: 'Application',
    content: [
      createSection(1, '一、立项依据', ['1.1 应用场景与现实需求', '1.2 现有路径的瓶颈']),
      createSection(2, '二、研究内容', ['2.1 模型构建与迭代', '2.2 多场景验证']),
      createSection(3, '三、研究基础', ['3.1 样本与数据条件', '3.2 团队协作基础'])
    ]
  },
  {
    title: '方案 C：强调交叉融合',
    focus: 'Interdisciplinary',
    content: [
      createSection(1, '一、立项依据', ['1.1 交叉学科背景', '1.2 关键科学挑战']),
      createSection(2, '二、研究内容', ['2.1 跨学科方法集成', '2.2 协同优化路线']),
      createSection(3, '三、研究基础', ['3.1 多学科研究经历', '3.2 已有合作网络'])
    ]
  },
  {
    title: '方案 D：强调方法论突破',
    focus: 'Methodology',
    content: [
      createSection(1, '一、立项依据', ['1.1 方法学现状', '1.2 关键理论缺口']),
      createSection(2, '二、研究内容', ['2.1 新方法设计', '2.2 对比实验与评估']),
      createSection(3, '三、研究基础', ['3.1 算法与工程基础', '3.2 试验条件保障'])
    ]
  },
  {
    title: '方案 E：强调系统工程',
    focus: 'System',
    content: [
      createSection(1, '一、立项依据', ['1.1 系统目标定义', '1.2 关键难点拆解']),
      createSection(2, '二、研究内容', ['2.1 子系统设计', '2.2 系统集成与验证']),
      createSection(3, '三、研究基础', ['3.1 软硬件基础条件', '3.2 先导系统原型'])
    ]
  }
];

export const generateOutlineCandidates = () => {
  const count = Math.floor(Math.random() * 4) + 2; // 2-5

  return outlineTemplates.slice(0, count).map((template, index) => ({
    ...template,
    id: `candidate-${Date.now()}-${index}`,
    fitScore: 90 + Math.floor(Math.random() * 9)
  }));
};

export const buildMockSources = (projectTitle: string): SourceItem[] => [
  {
    id: 'src-1',
    title: `${projectTitle}相关研究综述与挑战`,
    source: 'Nature Reviews',
    year: '2024',
    url: 'https://example.org/nature-review',
    abstract: '总结该领域关键进展，指出尚未解决的科学问题，可直接支撑立项依据章节。',
    sectionKey: '立项依据',
    score: 96,
    selected: true
  },
  {
    id: 'src-2',
    title: 'A benchmark dataset for scientific proposal modeling',
    source: 'arXiv',
    year: '2025',
    url: 'https://example.org/arxiv-dataset',
    abstract: '提供可复现的数据集与评估框架，适合用于研究内容中的方法验证。',
    sectionKey: '研究内容',
    score: 93,
    selected: true
  },
  {
    id: 'src-3',
    title: 'Cross-domain research infrastructure best practices',
    source: 'IEEE Xplore',
    year: '2023',
    url: 'https://example.org/ieee-infra',
    abstract: '阐述研究基础和平台建设策略，可作为研究基础章节的支撑资料。',
    sectionKey: '研究基础',
    score: 90,
    selected: false
  },
  {
    id: 'src-4',
    title: 'Field report on translational research outcomes',
    source: 'The Lancet Digital Health',
    year: '2025',
    url: 'https://example.org/lancet-report',
    abstract: '给出多中心验证经验，可用于研究内容中转化路径论证。',
    sectionKey: '研究内容',
    score: 88,
    selected: true
  }
];

export const createInitialDraft = (title: string) => {
  return `${title}\n\n一、立项依据\n本课题聚焦于...（演示稿）\n\n二、研究内容\n1. 研究任务一...\n2. 研究任务二...\n\n三、研究基础\n课题组已具备...\n`;
};
