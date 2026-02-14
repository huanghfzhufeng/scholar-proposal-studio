import type { MiniMaxMessage } from '@/services/llm/minimax-messages';

export class MiniMaxClient {
  constructor(private readonly apiKey: string) {}

  async chat(messages: MiniMaxMessage[]) {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is missing');
    }

    const endpoint = process.env.MINIMAX_BASE_URL || 'https://api.minimaxi.chat/v1/text/chatcompletion_v2';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: process.env.MINIMAX_MODEL || 'MiniMax-Text-01',
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax request failed: ${response.status}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
      reply?: string;
    };

    const text = json.choices?.[0]?.message?.content || json.reply || '';

    return {
      text
    };
  }
}
