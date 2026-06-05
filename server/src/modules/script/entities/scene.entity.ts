import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Script } from './script.entity';
import { Dialogue } from './dialogue.entity';

@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 100, name: 'scene_id' })
  sceneId!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ length: 200, nullable: true })
  location!: string;

  @Column({ length: 100, nullable: true })
  time!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @ManyToOne(() => Script, (script) => script.scenes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'script_id' })
  script!: Script;

  @OneToMany(() => Dialogue, (dialogue) => dialogue.scene, { cascade: true })
  dialogues!: Dialogue[];
}
