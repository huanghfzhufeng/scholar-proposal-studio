import type { InterviewMessage } from '@/agents/interview/types';

export const interviewTools = {
  summarizeHistory(history: InterviewMessage[]) {
    return history
      .slice(-8)
      .map((item) => `${item.role}: ${item.content}`)
      .join('\n');
  },
  estimateSufficiency(history: InterviewMessage[]) {
    const userTurns = history.filter((item) => item.role === 'user').length;
    return Math.min(0.95, 0.2 + userTurns * 0.1);
  }
};
