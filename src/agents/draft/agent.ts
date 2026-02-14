import { assertDraftInput } from '@/agents/draft/schema';
import { buildDraftPrompt, DRAFT_SYSTEM_PROMPT } from '@/agents/draft/prompt';
import { draftTools } from '@/agents/draft/tools';
import type { DraftInput, DraftOutput } from '@/agents/draft/types';
import { MiniMaxClient } from '@/services/llm/minimax-client';

export class DraftAgent {
  async run(input: DraftInput): Promise<DraftOutput> {
    assertDraftInput(input);

    const allowedSourceIds = new Set(
      draftTools
        .parseSources(input.sourceText)
        .filter((item) => item.selected)
        .map((item) => item.id)
    );
    const groundedFallback = draftTools.buildGroundedDraft(input.title, input.sourceText);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const result = await client.chat(
          [
            { role: 'system', content: DRAFT_SYSTEM_PROMPT },
            {
              role: 'user',
              content: buildDraftPrompt(input.title, input.outlineText, input.sourceText)
            }
          ],
          8192
        );

        if (result.text?.trim()) {
          const normalized = draftTools.normalizeParagraphs(result.text);
          const citations = draftTools.extractCitationIds(normalized);
          const hasUnverified = citations.some((citation) => !allowedSourceIds.has(citation));
          const insufficientSections = draftTools.findSectionsWithInsufficientCitations(normalized, 2);

          if (hasUnverified || insufficientSections.length > 0) {
            return {
              content: groundedFallback
            };
          }

          return {
            content: normalized
          };
        }
      } catch {
        // Fallback to template draft.
      }
    }

    return {
      content: draftTools.normalizeParagraphs(groundedFallback)
    };
  }

  async *runStream(input: DraftInput): AsyncGenerator<{ type: 'delta' | 'done'; data: string }> {
    assertDraftInput(input);

    const groundedFallback = draftTools.buildGroundedDraft(input.title, input.sourceText);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const stream = client.chatStream(
          [
            { role: 'system', content: DRAFT_SYSTEM_PROMPT },
            { role: 'user', content: buildDraftPrompt(input.title, input.outlineText, input.sourceText) }
          ],
          8192
        );

        for await (const chunk of stream) {
          yield { type: 'delta', data: chunk };
        }
      } catch {
        // Fallback: emit template at once
        yield { type: 'delta', data: draftTools.normalizeParagraphs(groundedFallback) };
      }
    } else {
      // Mock mode: simulate streaming by emitting in small batches
      const content = draftTools.normalizeParagraphs(groundedFallback);
      const chars = content.split('');
      for (let i = 0; i < chars.length; i += 5) {
        yield { type: 'delta', data: chars.slice(i, i + 5).join('') };
      }
    }

    yield { type: 'done', data: '' };
  }
}

