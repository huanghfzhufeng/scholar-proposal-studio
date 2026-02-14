export const RETRIEVAL_SYSTEM_PROMPT = `你是联网检索智能体。
请优先返回学术来源，过滤低质量站点，并为每个结果给出相关性评分。`;

export const buildRetrievalPrompt = (title: string, keywords: string[]) => {
  return `课题：${title}\n关键词：${keywords.join(', ')}\n请执行检索并返回结构化结果。`;
};
