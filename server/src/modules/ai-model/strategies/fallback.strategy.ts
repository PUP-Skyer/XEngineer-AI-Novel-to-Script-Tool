import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { DeepSeekProvider } from '../providers/deepseek.provider';
import { AiCompleteRequest, AiCompleteResponse } from '../ai-model.service';

interface ProviderEntry {
  name: string;
  provider: any;
  priority: number;
}

@Injectable()
export class FallbackStrategy {
  private readonly logger = new Logger(FallbackStrategy.name);
  private providers: ProviderEntry[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly openaiProvider: OpenAiProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly deepseekProvider: DeepSeekProvider,
  ) {
    this.providers = [
      { name: 'openai', provider: this.openaiProvider, priority: 1 },
      { name: 'anthropic', provider: this.anthropicProvider, priority: 2 },
      { name: 'deepseek', provider: this.deepseekProvider, priority: 3 },
    ];
  }

  async execute(
    providerName: string,
    request: AiCompleteRequest,
  ): Promise<AiCompleteResponse> {
    // 找到指定的 provider
    const primary = this.providers.find((p) => p.name === providerName);

    if (primary) {
      try {
        return await primary.provider.complete(request);
      } catch (error) {
        this.logger.warn(
          `Provider ${providerName} failed: ${(error as Error).message}. Trying fallback...`,
        );
      }
    }

    // 降级到其他可用的 provider
    const fallbacks = this.providers
      .filter((p) => p.name !== providerName)
      .sort((a, b) => a.priority - b.priority);

    for (const fallback of fallbacks) {
      try {
        this.logger.log(`Trying fallback provider: ${fallback.name}`);
        return await fallback.provider.complete(request);
      } catch (error) {
        this.logger.warn(
          `Fallback provider ${fallback.name} failed: ${(error as Error).message}`,
        );
        continue;
      }
    }

    throw new Error('所有 AI 模型提供商均不可用');
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const entry of this.providers) {
      try {
        results[entry.name] = await entry.provider.healthCheck();
      } catch {
        results[entry.name] = false;
      }
    }

    return results;
  }
}
