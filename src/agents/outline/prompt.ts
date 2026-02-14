export const OUTLINE_SYSTEM_PROMPT = `你是大纲编写智能体。
请基于访谈摘要生成 2-5 套候选大纲，并确保包含：立项依据、研究内容、研究基础。`;

export const buildOutlinePrompt = (title: string, interviewSummary: string) => {
  return `课题题目：${title}\n访谈摘要：${interviewSummary}\n请生成候选大纲。`;
};
