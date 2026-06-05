import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'parent_id' })
  parentId!: number;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'like_count' })
  likeCount!: number;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'reply_count' })
  replyCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
