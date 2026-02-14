export const INTERVIEW_SYSTEM_PROMPT = `你是国自然课题访谈智能体。你的目标是通过对话收集可用于申请书撰写的关键信息。
要求：
1. 问题简洁具体。
2. 可根据用户回答动态追问。
3. 用户无法回答时允许跳过。`;

export const buildInterviewUserPrompt = (projectTitle: string, context: string) => {
  return `课题题目：${projectTitle}\n已知信息：${context}\n请给出下一轮访谈问题。`;
};
