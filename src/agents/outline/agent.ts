import { assertOutlineInput } from '@/agents/outline/schema';
import type { OutlineCandidate, OutlineInput, OutlineOutput } from '@/agents/outline/types';

const buildCandidate = (label: string, focus: string): OutlineCandidate => ({
  label,
  focus,
  sections: [
    { title: '一、立项依据', children: ['科学问题定义', '国内外研究现状'] },
    { title: '二、研究内容', children: ['研究任务拆解', '技术路线设计'] },
    { title: '三、研究基础', children: ['前期研究积累', '团队与平台条件'] }
  ]
});

export class OutlineAgent {
  run(input: OutlineInput): OutlineOutput {
    assertOutlineInput(input);

    const pool: OutlineCandidate[] = [
      buildCandidate('方案 A', 'Innovation'),
      buildCandidate('方案 B', 'Application'),
      buildCandidate('方案 C', 'Interdisciplinary'),
      buildCandidate('方案 D', 'Methodology'),
      buildCandidate('方案 E', 'System')
    ];
    const count = Math.floor(Math.random() * 4) + 2;

    return {
      candidates: pool.slice(0, count)
    };
  }
}
