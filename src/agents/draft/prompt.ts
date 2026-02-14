export const DRAFT_SYSTEM_PROMPT = `你是全文编写智能体。
请基于锁定大纲和资料库来源生成整篇初稿，不得编造文献。
你只能使用提供的 source_id 引用来源，引用格式必须是 [[source_id]]。
禁止出现资料库之外的引用；每个一级章节至少使用 2 个不同引用。`;

export const buildDraftPrompt = (title: string, outline: string, sources: string) => {
  return `题目：${title}
大纲：${outline}
资料库来源（JSON）：${sources}

写作要求：
1) 输出完整中文初稿，覆盖“立项依据、研究内容、研究基础”。
2) 仅允许引用资料库中的 source_id，格式为 [[source_id]]。
3) 每个一级章节至少出现 2 个不同 source_id 引用。
4) 禁止输出任何未在资料库中出现的引用。
`;
};
