import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Novel } from './novel.entity';

@Entity('novel_tags')
export class NovelTag {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'novel_id' })
  novelId!: number;

  @ManyToOne(() => Novel, (novel) => novel.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'novel_id' })
  novel!: Novel;
}
