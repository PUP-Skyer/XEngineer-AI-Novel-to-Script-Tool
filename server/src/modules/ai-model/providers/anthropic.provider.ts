import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { BaseAiProvider } from './base.provider';
import { AiCompleteRequest, AiCompleteResponse } from '../ai-model.service';

@Injectable()
export class AnthropicProvider extends BaseAiProvider {
  readonly name = 'anthropic';
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = new Anthropic({
      apiKey: this.configService.get('ai.providers.anthropic.apiKey'),
    });
  }

  async complete(request: AiCompleteRequest): Promise<AiCompleteResponse> {
    const model =
      request.model || this.configService.get('ai.providers.anthropic.model');

    try {
      const response = await this.client.messages.create({
        model: model as any,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.7,
        system: request.systemPrompt || undefined,
        messages: [{ role: 'user', content: request.prompt }],
      });

      const textBlock = response.content.find(
        (block) => block.type === 'text',
      );

      return {
        content: textBlock?.text || '',
        model: response.model,
        provider: this.name,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens:
            response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      this.logger.error(
        `Anthropic API error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async *stream(
    request: AiCompleteRequest,
  ): AsyncGenerator<string, void, unknown> {
    const model =
      request.model || this.configService.get('ai.providers.anthropic.model');

    const stream = this.client.messages.stream({
      model: model as any,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt || undefined,
      messages: [{ role: 'user', content: request.prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
