import type { MiniMaxMessage } from '@/services/llm/minimax-messages';

export class MiniMaxClient {
  constructor(private readonly apiKey: string) { }

  async chat(messages: MiniMaxMessage[], maxTokensOverride?: number) {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is missing');
    }

    const endpoint = process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/anthropic';
    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.5';
    const useAnthropic = endpoint.includes('/anthropic');

    const response = useAnthropic
      ? await this.chatAnthropic(endpoint, model, messages, false, maxTokensOverride)
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

  async *chatStream(messages: MiniMaxMessage[], maxTokensOverride?: number): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is missing');
    }

    const endpoint = process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/anthropic';
    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.5';
    const useAnthropic = endpoint.includes('/anthropic');

    const response = useAnthropic
      ? await this.chatAnthropic(endpoint, model, messages, true, maxTokensOverride)
      : await this.chatLegacyStream(endpoint, model, messages);

    if (!response.ok) {
      throw new Error(`MiniMax stream request failed: ${response.status}`);
    }

    const body = response.body;
    if (!body) {
      return;
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            const text = this.extractStreamDelta(parsed, useAnthropic);
            if (text) {
              yield text;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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

  private async chatLegacyStream(endpoint: string, model: string, messages: MiniMaxMessage[]) {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    });
  }

  private async chatAnthropic(endpoint: string, model: string, messages: MiniMaxMessage[], stream = false, maxTokensOverride?: number) {
    const normalizedEndpoint = endpoint.endsWith('/v1/messages') ? endpoint : `${endpoint.replace(/\/+$/, '')}/v1/messages`;
    const defaultMax = Number(process.env.MINIMAX_MAX_TOKENS || 2048);
    const maxTokens = maxTokensOverride ?? defaultMax;
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
        ...(stream ? { stream: true } : {}),
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: fallbackConversation
      })
    });
  }

  private extractStreamDelta(parsed: Record<string, unknown>, isAnthropic: boolean): string {
    if (isAnthropic) {
      // Anthropic SSE: { type: "content_block_delta", delta: { type: "text_delta", text: "..." } }
      const delta = parsed.delta as { text?: string } | undefined;
      if (delta?.text) {
        return delta.text;
      }
      return '';
    }

    // Legacy/OpenAI-compatible SSE: { choices: [{ delta: { content: "..." } }] }
    const choices = parsed.choices as Array<{ delta?: { content?: string } }> | undefined;
    return choices?.[0]?.delta?.content || '';
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
