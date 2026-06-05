import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FallbackStrategy } from './strategies/fallback.strategy';

export interface AiCompleteRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompleteResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AiModelService {
  private readonly logger = new Logger(AiModelService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly fallbackStrategy: FallbackStrategy,
  ) {}

  async complete(request: AiCompleteRequest): Promise<AiCompleteResponse> {
    const provider =
      request.provider || this.configService.get<string>('ai.defaultProvider', 'openai');

    this.logger.log(
      `AI request: provider=${provider}, model=${request.model || 'default'}`,
    );

    try {
      const result = await this.fallbackStrategy.execute(provider!, request);
      return result;
    } catch (error) {
      this.logger.error(
        `AI request failed with provider ${provider}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async *stream(request: AiCompleteRequest): AsyncGenerator<string> {
    const provider =
      request.provider || this.configService.get('ai.defaultProvider');

    // 简化的流式实现
    const result = await this.complete(request);
    yield result.content;
  }

  async structuredOutput<T>(
    request: AiCompleteRequest,
    schema: any,
  ): Promise<T> {
    const enhancedPrompt = `${request.prompt}

请严格按照以下 JSON Schema 返回结果:
${JSON.stringify(schema, null, 2)}

注意: 请直接返回有效的 JSON 字符串，不要包含任何其他文字或 markdown 格式。`;

    const result = await this.complete({
      ...request,
      prompt: enhancedPrompt,
    });

    try {
      // 尝试从可能包含 markdown 代码块的响应中提取 JSON
      const jsonMatch = result.content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.content.trim();
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      this.logger.error(
        `Failed to parse structured output: ${(error as Error).message}`,
      );
      throw new Error(`AI 输出解析失败: ${(error as Error).message}`);
    }
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    return this.fallbackStrategy.healthCheck();
  }
}
