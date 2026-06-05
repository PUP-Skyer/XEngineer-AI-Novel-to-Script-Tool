import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ length: 50, nullable: true })
  nickname!: string;

  @Column({ length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl!: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: string;

  @Column({ type: 'enum', enum: ['active', 'banned', 'deleted'], default: 'active' })
  status!: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'exp_points' })
  expPoints!: number;

  @Column({ type: 'smallint', unsigned: true, default: 1 })
  level!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
