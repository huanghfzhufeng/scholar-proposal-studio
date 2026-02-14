import type { MiniMaxMessage } from '@/services/llm/minimax-messages';

export class MiniMaxClient {
  constructor(private readonly apiKey: string) {}

  async chat(messages: MiniMaxMessage[]) {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is missing');
    }

    return {
      text: messages[messages.length - 1]?.content ?? ''
    };
  }
}
