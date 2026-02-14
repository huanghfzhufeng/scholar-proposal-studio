import { assertDraftInput } from '@/agents/draft/schema';
import { buildDraftPrompt, DRAFT_SYSTEM_PROMPT } from '@/agents/draft/prompt';
import { draftTools } from '@/agents/draft/tools';
import type { DraftInput, DraftOutput } from '@/agents/draft/types';
import { MiniMaxClient } from '@/services/llm/minimax-client';

export class DraftAgent {
  async run(input: DraftInput): Promise<DraftOutput> {
    assertDraftInput(input);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const result = await client.chat([
          { role: 'system', content: DRAFT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildDraftPrompt(input.title, input.outlineText, input.sourceText)
          }
        ]);

        if (result.text?.trim()) {
          return {
            content: draftTools.normalizeParagraphs(result.text)
          };
        }
      } catch {
        // Fallback to template draft.
      }
    }

    const raw = `${input.title}\n\n一、立项依据\n本课题围绕核心科学问题展开，结合现有研究进展与关键缺口提出研究假设。\n\n二、研究内容\n围绕研究目标设置任务分解、技术路线与验证方案，确保研究步骤可执行。\n\n三、研究基础\n课题组已具备前期研究积累、数据与平台条件，可支撑项目顺利实施。`;

    return {
      content: draftTools.normalizeParagraphs(raw)
    };
  }
}
