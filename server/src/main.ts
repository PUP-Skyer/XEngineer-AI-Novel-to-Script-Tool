import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局响应格式化拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('AI Script Game API')
    .setDescription('AI 小说转剧本 + 剧本杀游戏平台 API 文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('user', '用户相关')
    .addTag('novel', '小说相关')
    .addTag('script', '剧本相关')
    .addTag('game', '游戏相关')
    .addTag('social', '社交相关')
    .addTag('achievement', '成就相关')
    .addTag('ai-model', 'AI 模型管理')
    .addTag('notification', '通知相关')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);

  console.log(`[ASG Server] Application is running on: http://localhost:${port}`);
  console.log(`[ASG Server] Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
