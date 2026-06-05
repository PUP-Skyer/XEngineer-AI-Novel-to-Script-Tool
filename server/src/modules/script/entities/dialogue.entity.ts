import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Script } from './script.entity';
import { Scene } from './scene.entity';

@Entity('dialogues')
export class Dialogue {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 100, name: 'character_id_ref' })
  characterIdRef!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  action!: string;

  @Column({ length: 50, nullable: true })
  emotion!: string;

  @Column({ length: 500, nullable: true, name: 'stage_direction' })
  stageDirection!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'scene_id' })
  sceneId!: number;

  @ManyToOne(() => Script, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'script_id' })
  script!: Script;

  @ManyToOne(() => Scene, (scene) => scene.dialogues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scene_id' })
  scene!: Scene;
}
