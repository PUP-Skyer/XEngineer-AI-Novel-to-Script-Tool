import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { NovelGenerationProcessor } from './processors/novel-generation.processor';
import { ScriptConversionProcessor } from './processors/script-conversion.processor';
import { NovelModule } from '../modules/novel/novel.module';
import { ScriptModule } from '../modules/script/script.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get('redis.password') || undefined,
          db: config.get<number>('redis.db'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'novel-generation' },
      { name: 'script-conversion' },
    ),
    NovelModule,
    ScriptModule,
  ],
  providers: [NovelGenerationProcessor, ScriptConversionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
