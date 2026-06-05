import { Injectable, BadRequestException } from '@nestjs/common';
import * as yaml from 'yaml';
import { ScriptYamlSchema } from '../schemas/script.schema';

@Injectable()
export class YamlValidator {
  validate(yamlContent: string): { valid: boolean; errors?: string[] } {
    try {
      // 1. 解析 YAML
      const parsed = yaml.parse(yamlContent);

      if (!parsed || typeof parsed !== 'object') {
        throw new BadRequestException('无效的 YAML 格式');
      }

      // 2. Zod 校验（使用增强后的 Schema）
      const result = ScriptYamlSchema.safeParse(parsed);

      if (!result.success) {
        const errors = result.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        throw new BadRequestException(`剧本格式校验失败: ${errors}`);
      }

      // 3. 额外业务校验
      const hasKiller = result.data.characters.some((c) => c.is_killer);
      if (!hasKiller) {
        throw new BadRequestException('剧本中必须至少有一个凶手角色');
      }

      // 检查所有对白的 character_id 是否都存在于角色列表中（null 表示旁白，跳过）
      const characterIds = new Set(result.data.characters.map((c) => c.id));
      for (const scene of result.data.scenes) {
        for (const dialogue of scene.dialogues) {
          if (dialogue.character_id && !characterIds.has(dialogue.character_id)) {
            throw new BadRequestException(
              `场景 "${scene.title}" 中引用了不存在的角色: ${dialogue.character_id}`,
            );
          }
        }
        // 校验 choices 的 target_scene_id 是否指向有效场景
        if (scene.choices) {
          const sceneIds = new Set(result.data.scenes.map((s) => s.id));
          for (const choice of scene.choices) {
            if (!sceneIds.has(choice.target_scene_id)) {
              throw new BadRequestException(
                `场景 "${scene.title}" 中选项 "${choice.text}" 跳转目标不存在: ${choice.target_scene_id}`,
              );
            }
          }
        }
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`YAML 解析错误: ${(error as Error).message}`);
    }
  }
}
