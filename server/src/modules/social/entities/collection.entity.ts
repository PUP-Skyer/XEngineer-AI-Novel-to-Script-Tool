import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('collections')
@Unique(['userId', 'scriptId'])
export class Collection {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'script_id' })
  scriptId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
