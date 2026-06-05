import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { appConfig, databaseConfig, redisConfig, jwtConfig, aiConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { NovelModule } from './modules/novel/novel.module';
import { ScriptModule } from './modules/script/script.module';
import { GameModule } from './modules/game/game.module';
import { SocialModule } from './modules/social/social.module';
import { AchievementModule } from './modules/achievement/achievement.module';
import { AiModelModule } from './modules/ai-model/ai-model.module';
import { NotificationModule } from './modules/notification/notification.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    // 全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, aiConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM (MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: config.get('app.nodeEnv') === 'development',
        logging: config.get('app.nodeEnv') === 'development',
        charset: 'utf8mb4',
        timezone: '+08:00',
      }),
    }),

    // 限流
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 业务模块
    AuthModule,
    UserModule,
    NovelModule,
    ScriptModule,
    GameModule,
    SocialModule,
    AchievementModule,
    AiModelModule,
    NotificationModule,
    QueueModule,
  ],
})
export class AppModule {}
