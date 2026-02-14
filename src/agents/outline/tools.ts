import type { OutlineCandidate } from '@/agents/outline/types';

export const outlineTools = {
  ensureRequiredSections(candidate: OutlineCandidate) {
    const required = ['立项依据', '研究内容', '研究基础'];
    const titleText = candidate.sections.map((item) => item.title).join('|');
    return required.every((name) => titleText.includes(name));
  },
  clampCandidateCount(count: number) {
    return Math.min(5, Math.max(2, count));
  }
};
