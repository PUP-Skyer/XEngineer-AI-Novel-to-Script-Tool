import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novel } from '../../novel/entities/novel.entity';
import { AiModelService } from '../../ai-model/ai-model.service';
import { ScriptConversionResult, ScriptMetadata } from '../../../common/interfaces';
import { YamlGenerator } from './yaml-generator';
import { YamlValidator } from './yaml-validator';

@Injectable()
export class NovelToScriptConverter {
  constructor(
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    private readonly aiModelService: AiModelService,
    private readonly yamlGenerator: YamlGenerator,
    private readonly yamlValidator: YamlValidator,
  ) {}

  async convert(novelId: number): Promise<ScriptConversionResult> {
    // 1. 获取小说内容
    const novel = await this.novelRepository.findOne({ where: { id: novelId } });
    if (!novel || !novel.content) {
      throw new Error('小说内容为空或不存在');
    }

    // 2. 调用 AI 进行转换
    const prompt = this.buildConversionPrompt(novel.content, novel.title);

    const aiResult = await this.aiModelService.complete({
      prompt,
      systemPrompt: `你是一位专业的剧本杀编剧。你的任务是将小说内容转换为剧本杀剧本。
你需要:
1. 设计 4-8 个角色，每个角色有独特的背景故事和秘密
2. 设计 5-10 个场景
3. 每个场景中包含角色之间的对白
4. 确保有至少一个"凶手"角色和完整的推理线索链
5. 输出格式为严格的 JSON`,
      temperature: 0.7,
    });

    // 3. 解析 AI 输出
    const parsed = this.parseAiResult(aiResult.content);

    // 4. 生成 YAML
    const yamlContent = this.yamlGenerator.generate(parsed);

    // 5. 校验 YAML
    this.yamlValidator.validate(yamlContent);

    return {
      yamlContent,
      characters: parsed.characters,
      scenes: parsed.scenes,
      metadata: parsed.metadata,
    };
  }

  private buildConversionPrompt(novelContent: string, title: string): string {
    const truncatedContent = novelContent.substring(0, 15000);

    return `你是一位专业的剧本杀编剧。你的任务是将小说内容转换为剧本杀剧本。

小说标题: ${title}

小说内容:
${truncatedContent}

转换要求:
1. 设计 4-8 个角色，每个角色有独特的性格、背景故事和秘密
2. 设计 5-10 个场景，每个场景有明确的地点和时间
3. 每个场景中包含角色之间的自然对白
4. 确保有至少一个"凶手"角色（isKiller: true）
5. 在关键场景末尾设计 2-3 个选择分支（choices），让玩家决定剧情走向
6. 添加 DM 旁白（characterId 设为 null）推进剧情、营造氛围
7. 每个角色需要完整的 personality（性格）和 motivation（动机）

请返回 JSON 格式，结构如下:
{
  "metadata": {
    "title": "剧本标题",
    "author": "AI",
    "playerCount": { "min": 4, "max": 6 },
    "duration": "3小时",
    "difficulty": "medium",
    "genre": "类型",
    "synopsis": "故事梗概"
  },
  "characters": [
    {
      "id": "char_detective",
      "name": "角色名",
      "description": "角色简介",
      "personality": "性格特点",
      "backstory": "背景故事",
      "secret": "角色秘密（不能主动透露）",
      "motivation": "角色动机",
      "relationships": "与其他角色的关系",
      "isKiller": false
    }
  ],
  "scenes": [
    {
      "id": "scene_01",
      "title": "场景标题",
      "location": "地点",
      "time": "时间",
      "description": "场景描述",
      "atmosphere": "氛围描述",
      "dialogues": [
        {
          "characterId": null,
          "type": "narration",
          "content": "旁白叙述内容"
        },
        {
          "characterId": "char_detective",
          "type": "dialogue",
          "content": "对白内容",
          "action": "动作描写",
          "emotion": "情绪"
        }
      ],
      "choices": [
        {
          "id": "choice_01_a",
          "text": "选项文本",
          "targetSceneId": "scene_02_a",
          "consequence": "选择后果描述"
        }
      ]
    }
  ]
}`;
  }

  private parseAiResult(content: string): Omit<ScriptConversionResult, 'yamlContent'> {
    try {
      // 尝试从 markdown 代码块中提取 JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();

      const parsed = JSON.parse(jsonStr);

      return {
        metadata: parsed.metadata || this.getDefaultMetadata(),
        characters: (parsed.characters || []).map((char: any) => ({
          id: char.id || `char_${Math.random().toString(36).substring(2, 8)}`,
          name: char.name || '未知角色',
          alias: char.alias,
          description: char.description || '',
          personality: char.personality,
          backstory: char.backstory,
          secret: char.secret,
          motivation: char.motivation,
          relationships: char.relationships,
          isKiller: char.isKiller || false,
          imageUrl: char.imageUrl,
        })),
        scenes: (parsed.scenes || []).map((scene: any) => ({
          id: scene.id || `scene_${Math.random().toString(36).substring(2, 8)}`,
          title: scene.title || '未知场景',
          location: scene.location || '',
          time: scene.time || '',
          description: scene.description || '',
          atmosphere: scene.atmosphere,
          dialogues: (scene.dialogues || []).map((d: any) => ({
            characterId: d.characterId ?? null,
            type: d.type || (d.characterId ? 'dialogue' : 'narration'),
            content: d.content || '',
            action: d.action,
            emotion: d.emotion,
            stageDirection: d.stageDirection,
          })),
          choices: (scene.choices || []).map((c: any) => ({
            id: c.id || `choice_${Math.random().toString(36).substring(2, 8)}`,
            text: c.text || '',
            targetSceneId: c.targetSceneId || '',
            condition: c.condition,
            consequence: c.consequence,
          })),
        })),
      };
    } catch (error) {
      throw new Error(`AI 输出解析失败: ${(error as Error).message}`);
    }
  }

  private getDefaultMetadata(): ScriptMetadata {
    return {
      title: '未命名剧本',
      author: 'AI',
      playerCount: { min: 4, max: 6 },
      duration: '3-4小时',
      difficulty: 'medium',
      genre: 'mystery',
      synopsis: '由 AI 生成的剧本',
    };
  }
}
