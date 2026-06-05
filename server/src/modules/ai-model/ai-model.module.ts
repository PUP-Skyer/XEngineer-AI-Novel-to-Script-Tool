import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AiModelService } from './ai-model.service';
import { AiModelConfigController } from './ai-model-config.controller';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { FallbackStrategy } from './strategies/fallback.strategy';
import { AiModelConfig } from './entities/ai-model-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiModelConfig]), ConfigModule],
  controllers: [AiModelConfigController],
  providers: [
    AiModelService,
    OpenAiProvider,
    AnthropicProvider,
    DeepSeekProvider,
    FallbackStrategy,
    {
      provide: 'AI_PROVIDERS',
      useFactory: (
        openai: OpenAiProvider,
        anthropic: AnthropicProvider,
        deepseek: DeepSeekProvider,
      ) => ({
        openai,
        anthropic,
        deepseek,
      }),
      inject: [OpenAiProvider, AnthropicProvider, DeepSeekProvider],
    },
  ],
  exports: [AiModelService],
})
export class AiModelModule {}
