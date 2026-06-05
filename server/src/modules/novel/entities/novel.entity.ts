import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { NovelTag } from './novel-tag.entity';

@Entity('novels')
export class Novel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'longtext', nullable: true })
  content!: string;

  @Column({ length: 50, default: 'fantasy' })
  genre!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'word_count' })
  wordCount!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'author_id' })
  authorId!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'generated', 'editing', 'published', 'archived'],
    default: 'draft',
  })
  status!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'view_count' })
  viewCount!: number;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'like_count' })
  likeCount!: number;

  @Column({ length: 500, nullable: true, name: 'cover_url' })
  coverUrl!: string;

  @OneToMany(() => NovelTag, (tag) => tag.novel, { cascade: true })
  tags!: NovelTag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date;
}
