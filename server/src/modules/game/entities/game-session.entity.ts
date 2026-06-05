import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('game_sessions')
export class GameSession {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 50, name: 'room_code', unique: true })
  roomCode!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'host_id' })
  hostId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 6, name: 'max_players' })
  maxPlayers!: number;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'current_players' })
  currentPlayers!: number;

  @Column({
    type: 'enum',
    enum: ['waiting', 'playing', 'paused', 'ended'],
    default: 'waiting',
  })
  status!: string;

  @Column({ type: 'boolean', default: false, name: 'is_single_player' })
  isSinglePlayer!: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'winner' })
  winner!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'total_rounds' })
  totalRounds!: number;

  @Column({ type: 'datetime', nullable: true, name: 'started_at' })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true, name: 'ended_at' })
  endedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
