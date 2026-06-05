import { Injectable, Logger } from '@nestjs/common';
import { AiModelService } from '../../ai-model/ai-model.service';

interface AiPlayerConfig {
  userId: number;
  name: string;
  characterId: string;
  characterName: string;
  characterDescription: string;
  backstory: string;
  secret: string;
  isKiller: boolean;
}

@Injectable()
export class AiPlayer {
  private readonly logger = new Logger(AiPlayer.name);

  // 存储 AI 玩家配置
  private aiPlayers = new Map<number, AiPlayerConfig>();

  constructor(private readonly aiModelService: AiModelService) {}

  registerAiPlayer(config: AiPlayerConfig): void {
    this.aiPlayers.set(config.userId, config);
  }

  async generateDialogue(
    userId: number,
    context: {
      sceneTitle: string;
      sceneDescription: string;
      recentDialogues: { characterName: string; content: string }[];
      availableChoices?: string[];
    },
  ): Promise<string> {
    const config = this.aiPlayers.get(userId);
    if (!config) {
      throw new Error(`AI 玩家 ${userId} 不存在`);
    }

    const systemPrompt = this.buildSystemPrompt(config);
    const userPrompt = this.buildUserPrompt(config, context);

    try {
      const result = await this.aiModelService.complete({
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.8,
        maxTokens: 500,
      });

      return result.content.trim();
    } catch (error) {
      this.logger.error(`AI 玩家生成对白失败: ${(error as Error).message}`);
      return this.getFallbackDialogue(config);
    }
  }

  async generateAccusation(
    userId: number,
    otherPlayers: { userId: number; characterName: string }[],
  ): Promise<{ targetUserId: number; reason: string }> {
    const config = this.aiPlayers.get(userId);
    if (!config) {
      throw new Error(`AI 玩家 ${userId} 不存在`);
    }

    const playerList = otherPlayers
      .map((p) => `- ${p.characterName} (ID: ${p.userId})`)
      .join('\n');

    const prompt = `你正在玩一场剧本杀游戏。你扮演的角色是"${config.characterName}"。
${config.isKiller ? '你就是凶手，你需要伪装成好人，并将嫌疑引向别人。' : '你不是凶手，你需要找出真正的凶手。'}

其他玩家:
${playerList}

请根据你掌握的信息，选择一个你认为最可疑的玩家进行指控。
请以 JSON 格式返回: { "targetUserId": <number>, "reason": "<string>" }`;

    try {
      const result = await this.aiModelService.complete({
        prompt,
        systemPrompt: '你是一个善于推理的剧本杀玩家。请仔细分析线索，做出合理的判断。',
        temperature: 0.7,
      });

      const parsed = JSON.parse(result.content.replace(/```json?\s*([\s\S]*?)```/, '$1'));
      return {
        targetUserId: parsed.targetUserId || otherPlayers[0]?.userId || 0,
        reason: parsed.reason || '我觉得你很可疑',
      };
    } catch (error) {
      this.logger.error(`AI 玩家生成指控失败: ${(error as Error).message}`);
      // 随机选择一个目标
      const randomIndex = Math.floor(Math.random() * otherPlayers.length);
      return {
        targetUserId: otherPlayers[randomIndex]?.userId || 0,
        reason: '直觉告诉我你是凶手',
      };
    }
  }

  async generateVote(
    userId: number,
    accusations: { userId: number; reason: string }[],
  ): Promise<number> {
    const config = this.aiPlayers.get(userId);
    if (!config) {
      return accusations[0]?.userId || 0;
    }

    const accusationList = accusations
      .map((a) => `玩家 ${a.userId} 被指控: ${a.reason}`)
      .join('\n');

    const prompt = `你正在玩剧本杀游戏的投票阶段。你扮演"${config.characterName}"。
${config.isKiller ? '你是凶手，你需要把票投给非凶手的好人。' : '你需要找出凶手并投票。'}

指控记录:
${accusationList}

请投票给一个玩家。返回一个 JSON: { "targetUserId": <number> }`;

    try {
      const result = await this.aiModelService.complete({
        prompt,
        systemPrompt: '你是一个理性的剧本杀玩家。请基于证据做出投票决定。',
        temperature: 0.5,
      });

      const parsed = JSON.parse(result.content.replace(/```json?\s*([\s\S]*?)```/, '$1'));
      return parsed.targetUserId || accusations[0]?.userId || 0;
    } catch {
      return accusations[0]?.userId || 0;
    }
  }

  private buildSystemPrompt(config: AiPlayerConfig): string {
    let prompt = `你是一个剧本杀游戏中的角色。请严格按照角色设定进行扮演。

角色名: ${config.characterName}
角色描述: ${config.characterDescription}
背景故事: ${config.backstory}
秘密: ${config.secret}
${config.isKiller ? '你是这场案件的凶手。你需要伪装成无辜者，并将嫌疑引向其他玩家。' : '你不是凶手。你需要通过观察和推理找出真凶。'}

规则:
1. 始终以角色的身份发言
2. 根据角色的背景和秘密来决定言行
3. 不要暴露自己的秘密（除非被逼问）
4. 保持角色的性格特点
5. 回复要简洁自然，符合对话场景`;

    return prompt;
  }

  private buildUserPrompt(
    config: AiPlayerConfig,
    context: {
      sceneTitle: string;
      sceneDescription: string;
      recentDialogues: { characterName: string; content: string }[];
      availableChoices?: string[];
    },
  ): string {
    let prompt = `当前场景: ${context.sceneTitle}
场景描述: ${context.sceneDescription}

最近的对话:\n`;

    context.recentDialogues.forEach((d) => {
      prompt += `${d.characterName}: ${d.content}\n`;
    });

    if (context.availableChoices && context.availableChoices.length > 0) {
      prompt += `\n可选的行动:\n`;
      context.availableChoices.forEach((choice, i) => {
        prompt += `${i + 1}. ${choice}\n`;
      });
      prompt += `\n请选择一个行动并说明理由。`;
    } else {
      prompt += `\n请以"${config.characterName}"的身份回应或行动。`;
    }

    return prompt;
  }

  private getFallbackDialogue(config: AiPlayerConfig): string {
    const fallbacks = [
      '......',
      '让我想想......',
      '这个问题很有意思。',
      '我需要更多信息才能判断。',
      '暂时不好说。',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
