import { z } from 'zod';

// ============================================================
// AI 小说转剧本杀 — YAML Schema 定义
// 文档见: docs/yaml-schema-design.md
// ============================================================

// --- 剧本元数据 ---
export const ScriptMetadataSchema = z.object({
  /** 剧本标题 */
  title: z.string().min(1),
  /** 作者（默认 "AI"） */
  author: z.string().min(1),
  /** 游玩人数范围 */
  player_count: z.object({
    min: z.number().min(2).max(12),
    max: z.number().min(2).max(12),
  }),
  /** 预计时长（如 "3小时"） */
  duration: z.string(),
  /** 难度等级 */
  difficulty: z.enum(['easy', 'medium', 'hard']),
  /** 剧本类型 */
  genre: z.string(),
  /** 故事梗概 */
  synopsis: z.string(),
});

// --- 角色 ---
export const CharacterSchema = z.object({
  /** 唯一标识符（如 "char_detective"） */
  id: z.string().min(1),
  /** 角色名 */
  name: z.string().min(1),
  /** 别名/代号 */
  alias: z.string().nullable().optional(),
  /** 角色类型：protagonist(主角) / antagonist(反派) / supporting(配角) / npc / dm(主持人) */
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'npc', 'dm']).optional(),
  /** 角色简介 */
  description: z.string(),
  /** 性格特点 */
  personality: z.string().optional(),
  /** 背景故事 */
  backstory: z.string().nullable().optional(),
  /** 角色秘密（不能主动透露） */
  secret: z.string().nullable().optional(),
  /** 角色动机 */
  motivation: z.string().nullable().optional(),
  /** 与其他角色的关系（JSON 字符串或自然语言） */
  relationships: z.string().nullable().optional(),
  /** 是否为凶手（剧本杀核心线索） */
  is_killer: z.boolean().optional(),
  /** 是否可被玩家选择 */
  is_playable: z.boolean().optional(),
  /** 头像 URL */
  image_url: z.string().nullable().optional(),
  /** AI 扮演此角色时的 system prompt */
  ai_prompt: z.string().nullable().optional(),
});

// --- 选择分支 ---
export const ChoiceSchema = z.object({
  /** 选项唯一标识 */
  id: z.string().min(1),
  /** 选项显示文本 */
  text: z.string().min(1),
  /** 跳转目标场景 ID */
  target_scene_id: z.string(),
  /** 触发条件（可选，如角色/之前的选择） */
  condition: z.string().nullable().optional(),
  /** 选择后果描述 */
  consequence: z.string().nullable().optional(),
});

// --- 对白 ---
export const DialogueSchema = z.object({
  /** 说话角色 ID（null 表示旁白/DM） */
  character_id: z.string().nullable(),
  /** 对白类型：dialogue(对话) / narration(旁白叙述) / narration_dm(DM 主持人旁白) / stage_direction(舞台指示) */
  type: z.enum(['dialogue', 'narration', 'narration_dm', 'stage_direction']).optional(),
  /** 对白内容 */
  content: z.string().min(1),
  /** 动作描写（如 "拍桌子"） */
  action: z.string().nullable().optional(),
  /** 情绪（如 "愤怒" "恐惧"） */
  emotion: z.string().nullable().optional(),
  /** 舞台指示 */
  stage_direction: z.string().nullable().optional(),
});

// --- 场景 ---
export const SceneSchema = z.object({
  /** 场景唯一标识 */
  id: z.string().min(1),
  /** 场景序号 */
  number: z.number().optional(),
  /** 场景标题 */
  title: z.string().min(1),
  /** 地点 */
  location: z.string(),
  /** 时间 */
  time: z.string(),
  /** 场景描述 */
  description: z.string(),
  /** 氛围描述 */
  atmosphere: z.string().optional(),
  /** 对白列表 */
  dialogues: z.array(DialogueSchema),
  /** 选择分支（可选，触发场景跳转） */
  choices: z.array(ChoiceSchema).optional(),
});

// --- 完整剧本 ---
export const ScriptYamlSchema = z.object({
  metadata: ScriptMetadataSchema,
  characters: z.array(CharacterSchema).min(2),
  scenes: z.array(SceneSchema).min(1),
});

// 导出类型
export type ScriptYamlType = z.infer<typeof ScriptYamlSchema>;
export type CharacterType = z.infer<typeof CharacterSchema>;
export type SceneType = z.infer<typeof SceneSchema>;
export type DialogueType = z.infer<typeof DialogueSchema>;
export type ChoiceType = z.infer<typeof ChoiceSchema>;
