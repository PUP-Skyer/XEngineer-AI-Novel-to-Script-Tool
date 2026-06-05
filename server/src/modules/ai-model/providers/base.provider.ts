import { AiCompleteRequest, AiCompleteResponse } from '../ai-model.service';

export abstract class BaseAiProvider {
  abstract readonly name: string;

  abstract complete(request: AiCompleteRequest): Promise<AiCompleteResponse>;

  async *stream(request: AiCompleteRequest): AsyncGenerator<string> {
    // 默认实现: 直接返回完整结果
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

注意: 请直接返回有效的 JSON 字符串。`;

    const result = await this.complete({
      ...request,
      prompt: enhancedPrompt,
    });

    const jsonMatch = result.content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.content.trim();
    return JSON.parse(jsonStr) as T;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.complete({
        prompt: 'Say "ok"',
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }
}
