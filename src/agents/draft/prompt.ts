export const DRAFT_SYSTEM_PROMPT = `你是全文编写智能体。
请基于锁定大纲和资料库来源生成整篇初稿，不得编造文献。`;

export const buildDraftPrompt = (title: string, outline: string, sources: string) => {
  return `题目：${title}\n大纲：${outline}\n资料：${sources}\n请生成完整初稿。`;
};
