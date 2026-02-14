import { assertDraftInput } from '@/agents/draft/schema';
import { draftTools } from '@/agents/draft/tools';
import type { DraftInput, DraftOutput } from '@/agents/draft/types';

export class DraftAgent {
  run(input: DraftInput): DraftOutput {
    assertDraftInput(input);

    const raw = `${input.title}\n\n一、立项依据\n...\n\n二、研究内容\n...\n\n三、研究基础\n...`;

    return {
      content: draftTools.normalizeParagraphs(raw)
    };
  }
}
