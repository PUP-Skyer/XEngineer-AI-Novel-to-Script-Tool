import { Injectable } from '@nestjs/common';
import * as yaml from 'yaml';
import { ScriptMetadata, ScriptCharacter, ScriptScene } from '../../../common/interfaces';

interface YamlData {
  metadata: ScriptMetadata;
  characters: ScriptCharacter[];
  scenes: ScriptScene[];
  choices?: Array<{
    id: string;
    text: string;
    targetSceneId: string;
    condition?: string;
    consequence?: string;
  }>;
}

@Injectable()
export class YamlGenerator {
  generate(data: YamlData): string {
    const yamlData = {
      metadata: {
        title: data.metadata.title,
        author: data.metadata.author,
        player_count: {
          min: data.metadata.playerCount.min,
          max: data.metadata.playerCount.max,
        },
        duration: data.metadata.duration,
        difficulty: data.metadata.difficulty,
        genre: data.metadata.genre,
        synopsis: data.metadata.synopsis,
      },
      characters: data.characters.map((char) => ({
        id: char.id,
        name: char.name,
        alias: char.alias || null,
        role: char.isKiller ? 'antagonist' : 'supporting',
        description: char.description,
        personality: char.description.substring(0, 100),
        backstory: char.backstory || null,
        secret: char.secret || null,
        motivation: null,
        relationships: null,
        is_killer: char.isKiller || false,
        is_playable: true,
        image_url: char.imageUrl || null,
        ai_prompt: null,
      })),
      scenes: data.scenes.map((scene, sceneIndex) => ({
        id: scene.id,
        number: sceneIndex + 1,
        title: scene.title,
        location: scene.location,
        time: scene.time,
        description: scene.description,
        atmosphere: null,
        dialogues: scene.dialogues.map((d, i) => ({
          character_id: d.characterId || null,
          type: d.characterId ? 'dialogue' : 'narration',
          content: d.content,
          action: d.action || null,
          emotion: d.emotion || null,
          stage_direction: d.stageDirection || null,
          order: i + 1,
        })),
        choices: undefined as any,
      })),
    };

    // 如果有选择分支，附加到对应场景
    if (data.choices && data.choices.length > 0) {
      for (const scene of yamlData.scenes) {
        scene.choices = data.choices
          .filter((c) => c.targetSceneId)
          .map((c) => ({
            id: c.id,
            text: c.text,
            target_scene_id: c.targetSceneId,
            condition: c.condition || null,
            consequence: c.consequence || null,
          }));
      }
    }

    return yaml.stringify(yamlData);
  }
}
