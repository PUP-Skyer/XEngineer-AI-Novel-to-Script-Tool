import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { BaseAiProvider } from './base.provider';
import { AiCompleteRequest, AiCompleteResponse } from '../ai-model.service';

@Injectable()
export class DeepSeekProvider extends BaseAiProvider {
  readonly name = 'deepseek';
  private readonly logger = new Logger(DeepSeekProvider.name);
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = new OpenAI({
      apiKey: this.configService.get('ai.providers.deepseek.apiKey'),
      baseURL: this.configService.get('ai.providers.deepseek.baseUrl'),
    });
  }

  async complete(request: AiCompleteRequest): Promise<AiCompleteResponse> {
    const model =
      request.model || this.configService.get('ai.providers.deepseek.model');

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push({ role: 'user', content: request.prompt });

    try {
      const response = await this.client.chat.completions.create({
        model: model as any,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      });

      const choice = response.choices[0];

      return {
        content: choice.message.content || '',
        model: response.model,
        provider: this.name,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      this.logger.error(`DeepSeek API error: ${(error as Error).message}`);
      throw error;
    }
  }

  async *stream(
    request: AiCompleteRequest,
  ): AsyncGenerator<string, void, unknown> {
    const model =
      request.model || this.configService.get('ai.providers.deepseek.model');

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push({ role: 'user', content: request.prompt });

    const stream = await this.client.chat.completions.create({
      model: model as any,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
