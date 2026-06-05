import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('user_achievements')
@Unique(['userId', 'achievementId'])
export class UserAchievement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'achievement_id' })
  achievementId!: number;

  @Column({ type: 'datetime', name: 'earned_at' })
  earnedAt!: Date;

  @Column({ type: 'json', nullable: true, name: 'metadata' })
  metadata!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
