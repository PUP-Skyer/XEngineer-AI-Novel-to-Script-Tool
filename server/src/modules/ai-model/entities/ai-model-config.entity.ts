import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_model_configs')
export class AiModelConfig {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ length: 50, name: 'provider_name' })
  providerName!: string;

  @Column({ length: 100, name: 'model_name' })
  modelName!: string;

  @Column({ length: 500, nullable: true })
  displayName!: string;

  @Column({ type: 'text', nullable: true, name: 'api_endpoint' })
  apiEndpoint!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'int', unsigned: true, default: 1, name: 'priority' })
  priority!: number;

  @Column({ type: 'int', unsigned: true, default: 4096, name: 'max_tokens' })
  maxTokens!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature!: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, name: 'cost_per_1k_tokens' })
  costPer1kTokens!: number;

  @Column({ type: 'json', nullable: true, name: 'extra_config' })
  extraConfig!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
