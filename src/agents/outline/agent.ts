import { assertOutlineInput } from '@/agents/outline/schema';
import { OUTLINE_SYSTEM_PROMPT, buildOutlinePrompt } from '@/agents/outline/prompt';
import type { OutlineCandidate, OutlineInput, OutlineOutput } from '@/agents/outline/types';
import { MiniMaxClient } from '@/services/llm/minimax-client';

const buildCandidate = (label: string, focus: string): OutlineCandidate => ({
  label,
  focus,
  sections: [
    { title: '一、立项依据', children: ['科学问题定义', '国内外研究现状'] },
    { title: '二、研究内容', children: ['研究任务拆解', '技术路线设计'] },
    { title: '三、研究基础', children: ['前期研究积累', '团队与平台条件'] }
  ]
});

const staticFallback = (): OutlineCandidate[] => {
  const pool: OutlineCandidate[] = [
    buildCandidate('方案 A', 'Innovation'),
    buildCandidate('方案 B', 'Application'),
    buildCandidate('方案 C', 'Interdisciplinary'),
    buildCandidate('方案 D', 'Methodology'),
    buildCandidate('方案 E', 'System')
  ];
  const count = Math.floor(Math.random() * 4) + 2;
  return pool.slice(0, count);
};

const parseLlmOutlineCandidates = (text: string): OutlineCandidate[] | null => {
  try {
    let jsonStr = text.trim();

    // 1. Try safe match for markdown code block
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    // 2. Try parsing (handles both raw JSON and extracted block)
    const parsed = JSON.parse(jsonStr) as Array<{
      label?: string;
      focus?: string;
      sections?: Array<{ title?: string; children?: string[] }>;
    }>;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    const candidates: OutlineCandidate[] = parsed
      .filter((item) => item.label && item.sections && Array.isArray(item.sections))
      .map((item) => ({
        label: item.label!,
        focus: item.focus || 'General',
        sections: item.sections!
          .filter((s) => s.title && Array.isArray(s.children))
          .map((s) => ({
            title: s.title!,
            children: s.children!
          }))
      }));

    return candidates.length >= 2 ? candidates : null;
  } catch (e) {
    console.error('Outline parsing failed:', e);
    // If strict parsing fails, we could try relaxed parsing or repair, but for now fallback is safer
    return null;
  }
};

export class OutlineAgent {
  async run(input: OutlineInput): Promise<OutlineOutput> {
    assertOutlineInput(input);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const response = await client.chat(
          [
            { role: 'system', content: OUTLINE_SYSTEM_PROMPT + '\n\n请以 JSON 数组格式输出，每个元素包含 label(方案名), focus(侧重方向), sections 数组(每项包含 title 和 children 字符串数组)。输出 2-5 套候选大纲。' },
            { role: 'user', content: buildOutlinePrompt(input.projectTitle, input.interviewSummary) }
          ],
          4096
        );

        if (response.text) {
          const parsed = parseLlmOutlineCandidates(response.text);
          if (parsed) {
            return { candidates: parsed };
          }
        }
      } catch {
        // Fallback to static templates
      }
    }

    return {
      candidates: staticFallback()
    };
  }
}

