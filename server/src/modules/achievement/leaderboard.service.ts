import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

export enum LeaderboardType {
  EXP = 'exp',
  LEVEL = 'level',
  GAME_WINS = 'game_wins',
  NOVELS_CREATED = 'novels_created',
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取排行榜
   */
  async getLeaderboard(
    type: LeaderboardType = LeaderboardType.EXP,
    limit = 20,
    offset = 0,
  ) {
    let orderField: string;

    switch (type) {
      case LeaderboardType.EXP:
        orderField = 'expPoints';
        break;
      case LeaderboardType.LEVEL:
        orderField = 'level';
        break;
      default:
        orderField = 'expPoints';
    }

    const users = await this.userRepository.find({
      select: ['id', 'username', 'nickname', 'avatarUrl', 'expPoints', 'level'],
      order: { [orderField]: 'DESC' },
      take: limit,
      skip: offset,
      where: { status: 'active' },
    });

    return users.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      expPoints: user.expPoints,
      level: user.level,
    }));
  }

  /**
   * 获取用户排名
   */
  async getUserRank(userId: number, type: LeaderboardType = LeaderboardType.EXP) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['expPoints', 'level'],
    });

    if (!user) return null;

    const value =
      type === LeaderboardType.LEVEL ? user.level : user.expPoints;

    const rank = await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .andWhere(`user.${type === LeaderboardType.LEVEL ? 'level' : 'exp_points'} > :value`, {
        value,
      })
      .getCount();

    return {
      rank: rank + 1,
      value,
      type,
    };
  }

  /**
   * 获取总用户数
   */
  async getTotalActiveUsers(): Promise<number> {
    return this.userRepository.count({
      where: { status: 'active' },
    });
  }
}
