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
}
