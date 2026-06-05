import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AchievementService } from './achievement.service';
import { LeaderboardService } from './leaderboard.service';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, UserAchievement]),
    UserModule,
  ],
  providers: [AchievementService, LeaderboardService],
  exports: [AchievementService, LeaderboardService],
})
export class AchievementModule {}
