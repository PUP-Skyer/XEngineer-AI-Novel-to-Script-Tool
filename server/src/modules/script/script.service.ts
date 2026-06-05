import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Script } from './entities/script.entity';
import { Character } from './entities/character.entity';
import { Scene } from './entities/scene.entity';
import { Dialogue } from './entities/dialogue.entity';
import { NovelToScriptConverter } from './converter/novel-to-script.converter';
import { YamlGenerator } from './converter/yaml-generator';

@Injectable()
export class ScriptService {
  constructor(
    @InjectRepository(Script)
    private readonly scriptRepository: Repository<Script>,
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(Scene)
    private readonly sceneRepository: Repository<Scene>,
    @InjectRepository(Dialogue)
    private readonly dialogueRepository: Repository<Dialogue>,
    private readonly converter: NovelToScriptConverter,
    private readonly yamlGenerator: YamlGenerator,
  ) {}

  async convertFromNovel(userId: number, novelId: number): Promise<Script> {
    // 转换小说为剧本结构
    const conversionResult = await this.converter.convert(novelId);

    // 保存剧本
    const script = this.scriptRepository.create({
      title: conversionResult.metadata.title,
      novelId,
      userId,
      yamlContent: conversionResult.yamlContent,
      description: conversionResult.metadata.synopsis,
      playerCountMin: conversionResult.metadata.playerCount.min,
      playerCountMax: conversionResult.metadata.playerCount.max,
      estimatedDuration: conversionResult.metadata.duration,
      difficulty: conversionResult.metadata.difficulty,
      status: 'converted',
    } as Partial<Script>);

    const savedScript = await this.scriptRepository.save(script) as unknown as Script;

    // 保存角色
    const characters = conversionResult.characters.map((char) =>
      this.characterRepository.create({
        charId: char.id,
        name: char.name,
        alias: char.alias,
        description: char.description,
        backstory: char.backstory,
        secret: char.secret,
        isKiller: char.isKiller,
        imageUrl: char.imageUrl,
        scriptId: savedScript.id,
      }),
    );
    await this.characterRepository.save(characters) as Character[];

    // 保存场景
    for (const sceneData of conversionResult.scenes) {
      const scene = this.sceneRepository.create({
        scriptId: savedScript.id,
        title: sceneData.title,
        location: sceneData.location,
        time: sceneData.time,
        description: sceneData.description,
      });

      const savedScene = await this.sceneRepository.save(scene);

      // 保存对白
      const dialogues = sceneData.dialogues.map((dialogue) =>
        this.dialogueRepository.create({
          scriptId: savedScript.id,
          sceneId: savedScene.id,
          characterIdRef: dialogue.characterId || '',
          content: dialogue.content,
          action: dialogue.action || '',
          emotion: dialogue.emotion || '',
          stageDirection: dialogue.stageDirection || '',
        }),
      );
      await this.dialogueRepository.save(dialogues) as Dialogue[];
    }

    return this.findById(savedScript.id);
  }

  async findById(id: number): Promise<Script> {
    const script = await this.scriptRepository.findOne({
      where: { id },
      relations: ['characters', 'scenes'],
    });
    if (!script) {
      throw new NotFoundException('剧本不存在');
    }
    return script;
  }

  async getYamlContent(id: number): Promise<{ yaml: string }> {
    const script = await this.scriptRepository.findOne({ where: { id } });
    if (!script) {
      throw new NotFoundException('剧本不存在');
    }
    return { yaml: script.yamlContent };
  }

  async update(
    userId: number,
    scriptId: number,
    data: { title?: string; yamlContent?: string },
  ): Promise<Script> {
    const script = await this.findById(scriptId);

    if (script.userId !== userId) {
      throw new ForbiddenException('无权修改此剧本');
    }

    if (data.title) {
      script.title = data.title;
    }
    if (data.yamlContent) {
      script.yamlContent = data.yamlContent;
    }

    return this.scriptRepository.save(script);
  }

  async getCharacters(scriptId: number): Promise<Character[]> {
    const characters = await this.characterRepository.find({
      where: { scriptId },
    });
    return characters;
  }

  async getScenes(scriptId: number): Promise<Scene[]> {
    const scenes = await this.sceneRepository.find({
      where: { scriptId },
      relations: ['dialogues'],
      order: { id: 'ASC' },
    });
    return scenes;
  }
}
