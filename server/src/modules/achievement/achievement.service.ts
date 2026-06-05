import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private readonly userAchievementRepository: Repository<UserAchievement>,
    private readonly userService: UserService,
  ) {}

  /**
   * 检查并授予用户成就
   */
  async checkAndGrant(userId: number, eventType: string, eventData?: any) {
    const achievements = await this.achievementRepository.find({
      where: { triggerEvent: eventType, enabled: true },
    });

    const grantedAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      // 检查是否已获得
      const existing = await this.userAchievementRepository.findOne({
        where: { userId, achievementId: achievement.id },
      });

      if (existing) continue;

      // 检查前置条件
      const conditionsMet = await this.checkConditions(
        userId,
        achievement,
        eventData,
      );

      if (conditionsMet) {
        await this.grantAchievement(userId, achievement);
        grantedAchievements.push(achievement);
      }
    }

    return grantedAchievements;
  }

  /**
   * 手动授予成就
   */
  async grantAchievement(userId: number, achievement: Achievement) {
    const userAchievement = this.userAchievementRepository.create({
      userId,
      achievementId: achievement.id,
    });

    await this.userAchievementRepository.save(userAchievement);

    // 奖励经验值
    if (achievement.expReward > 0) {
      await this.userService.addExpPoints(userId, achievement.expReward);
    }

    this.logger.log(
      `用户 ${userId} 获得成就: ${achievement.name} (+${achievement.expReward} EXP)`,
    );

    return userAchievement;
  }

  /**
   * 获取用户的成就列表
   */
  async getUserAchievements(userId: number) {
    const allAchievements = await this.achievementRepository.find({
      where: { enabled: true },
      order: { sortOrder: 'ASC' },
    });

    const userAchievements = await this.userAchievementRepository.find({
      where: { userId },
    });

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return allAchievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: userAchievements.find((ua) => ua.achievementId === a.id)
        ?.earnedAt,
    }));
  }

  /**
   * 获取所有成就定义
   */
  async findAll() {
    return this.achievementRepository.find({
      where: { enabled: true },
      order: { sortOrder: 'ASC' },
    });
  }

  private async checkConditions(
    userId: number,
    achievement: Achievement,
    eventData?: any,
  ): Promise<boolean> {
    if (!achievement.conditionRule) return true;

    try {
      const rule = JSON.parse(achievement.conditionRule);
      // 基于事件类型检查条件
      switch (rule.type) {
        case 'game_count':
          return (eventData?.gameCount || 0) >= rule.threshold;
        case 'novel_count':
          return (eventData?.novelCount || 0) >= rule.threshold;
        case 'win_streak':
          return (eventData?.winStreak || 0) >= rule.threshold;
        case 'social_interactions':
          return (eventData?.socialCount || 0) >= rule.threshold;
        default:
          return true;
      }
    } catch {
      return true;
    }
  }
}
