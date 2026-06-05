import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('game_logs')
export class GameLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 50, name: 'session_code' })
  sessionCode!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  userId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'json', nullable: true })
  metadata!: string;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  round!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
