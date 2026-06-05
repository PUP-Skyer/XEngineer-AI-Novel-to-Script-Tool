import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';
import { Novel } from './entities/novel.entity';
import { NovelTag } from './entities/novel-tag.entity';
import { AiModelModule } from '../ai-model/ai-model.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Novel, NovelTag]),
    AiModelModule,
  ],
  controllers: [NovelController],
  providers: [NovelService],
  exports: [NovelService],
})
export class NovelModule {}
