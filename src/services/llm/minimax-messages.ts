export type MiniMaxMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const createMiniMaxMessages = (systemPrompt: string, userPrompt: string): MiniMaxMessage[] => [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
];
