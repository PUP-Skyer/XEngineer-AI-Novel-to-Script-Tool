import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column({ length: 200, nullable: true, name: 'icon_url' })
  iconUrl!: string;

  @Column({ length: 50, name: 'trigger_event' })
  triggerEvent!: string;

  @Column({ type: 'text', nullable: true, name: 'condition_rule' })
  conditionRule!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'exp_reward' })
  expReward!: number;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'sort_order' })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ length: 50, default: 'normal', comment: 'normal, rare, epic, legendary' })
  rarity!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
