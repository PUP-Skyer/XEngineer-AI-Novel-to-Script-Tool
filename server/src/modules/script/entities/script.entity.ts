import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Character } from './character.entity';
import { Scene } from './scene.entity';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'novel_id', nullable: true })
  novelId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'longtext', name: 'yaml_content', nullable: true })
  yamlContent!: string;

  @Column({ type: 'text', nullable: true })
  synopsis!: string;

  @Column({ type: 'tinyint', unsigned: true, default: 4, name: 'player_count_min' })
  playerCountMin!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 8, name: 'player_count_max' })
  playerCountMax!: number;

  @Column({ length: 50, default: '3-4小时' })
  duration!: string;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty!: string;

  @Column({
    type: 'enum',
    enum: ['converting', 'converted', 'editing', 'published', 'archived'],
    default: 'converting',
  })
  status!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'play_count' })
  playCount!: number;

  @OneToMany(() => Character, (character) => character.script, { cascade: true })
  characters!: Character[];

  @OneToMany(() => Scene, (scene) => scene.script, { cascade: true })
  scenes!: Scene[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
