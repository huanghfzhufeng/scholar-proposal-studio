import { assertInterviewInput } from '@/agents/interview/schema';
import { INTERVIEW_SYSTEM_PROMPT, buildInterviewUserPrompt } from '@/agents/interview/prompt';
import { interviewTools } from '@/agents/interview/tools';
import type { InterviewInput, InterviewOutput } from '@/agents/interview/types';
import { MiniMaxClient } from '@/services/llm/minimax-client';

export class InterviewAgent {
  async run(input: InterviewInput): Promise<InterviewOutput> {
    assertInterviewInput(input);

    const context = interviewTools.summarizeHistory(input.history);
    const sufficiencyScore = interviewTools.estimateSufficiency(input.history);
    let nextQuestion = buildInterviewUserPrompt(input.projectTitle, context);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const response = await client.chat([
          {
            role: 'system',
            content: INTERVIEW_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: buildInterviewUserPrompt(input.projectTitle, context)
          }
        ]);
        nextQuestion = response.text || nextQuestion;
      } catch {
        // Fallback to local prompt output.
      }
    }

    return {
      nextQuestion,
      sufficiencyScore,
      summary: context || '尚未收集到有效信息。'
    };
  }

  async *runStream(input: InterviewInput): AsyncGenerator<{ type: 'delta' | 'meta' | 'done'; data: string }> {
    assertInterviewInput(input);

    const context = interviewTools.summarizeHistory(input.history);
    const sufficiencyScore = interviewTools.estimateSufficiency(input.history);
    const fallbackQuestion = buildInterviewUserPrompt(input.projectTitle, context);

    const apiKey = process.env.MINIMAX_API_KEY || '';
    const useRealLlm = process.env.USE_REAL_LLM === 'true';

    if (apiKey && useRealLlm) {
      try {
        const client = new MiniMaxClient(apiKey);
        const stream = client.chatStream([
          { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
          { role: 'user', content: buildInterviewUserPrompt(input.projectTitle, context) }
        ]);

        for await (const chunk of stream) {
          yield { type: 'delta', data: chunk };
        }
      } catch {
        // Fallback: emit the entire fallback question at once
        yield { type: 'delta', data: fallbackQuestion };
      }
    } else {
      // Mock mode: simulate streaming by emitting characters in small batches
      const chars = fallbackQuestion.split('');
      for (let i = 0; i < chars.length; i += 3) {
        yield { type: 'delta', data: chars.slice(i, i + 3).join('') };
      }
    }

    yield { type: 'meta', data: JSON.stringify({ sufficiencyScore, summary: context || '尚未收集到有效信息。' }) };
    yield { type: 'done', data: '' };
  }
}

