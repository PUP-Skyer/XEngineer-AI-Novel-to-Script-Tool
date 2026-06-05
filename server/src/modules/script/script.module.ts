import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScriptController } from './script.controller';
import { ScriptService } from './script.service';
import { Script } from './entities/script.entity';
import { Character } from './entities/character.entity';
import { Scene } from './entities/scene.entity';
import { Dialogue } from './entities/dialogue.entity';
import { NovelToScriptConverter } from './converter/novel-to-script.converter';
import { YamlGenerator } from './converter/yaml-generator';
import { YamlValidator } from './converter/yaml-validator';
import { AiModelModule } from '../ai-model/ai-model.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Script, Character, Scene, Dialogue]),
    AiModelModule,
  ],
  controllers: [ScriptController],
  providers: [
    ScriptService,
    NovelToScriptConverter,
    YamlGenerator,
    YamlValidator,
  ],
  exports: [ScriptService],
})
export class ScriptModule {}
