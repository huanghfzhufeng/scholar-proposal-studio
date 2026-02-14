import type { MiniMaxMessage } from '@/services/llm/minimax-messages';

export class MiniMaxClient {
  constructor(private readonly apiKey: string) {}

  async chat(messages: MiniMaxMessage[]) {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is missing');
    }

    const endpoint = process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/anthropic';
    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.5';
    const useAnthropic = endpoint.includes('/anthropic');

    const response = useAnthropic
      ? await this.chatAnthropic(endpoint, model, messages)
      : await this.chatLegacy(endpoint, model, messages);

    if (!response.ok) {
      throw new Error(`MiniMax request failed: ${response.status}`);
    }

    const json = (await response.json()) as Record<string, unknown>;
    const text = this.extractResponseText(json);

    return {
      text
    };
  }

  private async chatLegacy(endpoint: string, model: string, messages: MiniMaxMessage[]) {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages
      })
    });
  }

  private async chatAnthropic(endpoint: string, model: string, messages: MiniMaxMessage[]) {
    const normalizedEndpoint = endpoint.endsWith('/v1/messages') ? endpoint : `${endpoint.replace(/\/+$/, '')}/v1/messages`;
    const maxTokens = Number(process.env.MINIMAX_MAX_TOKENS || 2048);
    const anthropicVersion = process.env.MINIMAX_ANTHROPIC_VERSION || '2023-06-01';

    const systemPrompt = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content.trim())
      .filter(Boolean)
      .join('\n\n');

    const conversation = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: [
          {
            type: 'text',
            text: message.content
          }
        ]
      }));

    const fallbackConversation =
      conversation.length > 0
        ? conversation
        : [
            {
              role: 'user',
              content: [{ type: 'text', text: '请根据系统提示输出结果。' }]
            }
          ];

    return fetch(normalizedEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': anthropicVersion
      },
      body: JSON.stringify({
        model,
        max_tokens: Number.isFinite(maxTokens) ? maxTokens : 2048,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: fallbackConversation
      })
    });
  }

  private extractResponseText(payload: Record<string, unknown>) {
    const choices = payload.choices as Array<{ message?: { content?: unknown } }> | undefined;
    const choiceText = choices?.[0]?.message?.content;

    if (typeof choiceText === 'string' && choiceText.trim()) {
      return choiceText;
    }

    const reply = payload.reply;
    if (typeof reply === 'string' && reply.trim()) {
      return reply;
    }

    const outputText = payload.output_text;
    if (typeof outputText === 'string' && outputText.trim()) {
      return outputText;
    }

    const content = payload.content;
    if (Array.isArray(content)) {
      const text = content
        .map((block) => {
          if (!block || typeof block !== 'object') {
            return '';
          }

          const maybeText = (block as { text?: unknown }).text;
          return typeof maybeText === 'string' ? maybeText : '';
        })
        .filter(Boolean)
        .join('\n');

      if (text.trim()) {
        return text;
      }
    }

    return '';
  }
}
