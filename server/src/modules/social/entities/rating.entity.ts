import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('ratings')
@Unique(['userId', 'scriptId'])
export class Rating {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '评分 1-5' })
  score!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
