import { assertInterviewInput } from '@/agents/interview/schema';
import { buildInterviewUserPrompt } from '@/agents/interview/prompt';
import { interviewTools } from '@/agents/interview/tools';
import type { InterviewInput, InterviewOutput } from '@/agents/interview/types';

export class InterviewAgent {
  run(input: InterviewInput): InterviewOutput {
    assertInterviewInput(input);

    const context = interviewTools.summarizeHistory(input.history);
    const sufficiencyScore = interviewTools.estimateSufficiency(input.history);

    return {
      nextQuestion: buildInterviewUserPrompt(input.projectTitle, context),
      sufficiencyScore,
      summary: context || '尚未收集到有效信息。'
    };
  }
}
