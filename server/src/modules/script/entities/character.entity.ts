import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Script } from './script.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 100, name: 'char_id' })
  charId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, nullable: true })
  alias!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  backstory!: string;

  @Column({ type: 'text', nullable: true })
  secret!: string;

  @Column({ type: 'boolean', default: false, name: 'is_killer' })
  isKiller!: boolean;

  @Column({ length: 500, nullable: true, name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @ManyToOne(() => Script, (script) => script.characters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'script_id' })
  script!: Script;
}
