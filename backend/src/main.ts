import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. CORS 白名单
  app.enableCors({
    origin: [
      'https://api.jxufe-tech.top',
      'https://miuma-blog.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = new DocumentBuilder()
    .setTitle('博客后台 API')
    .setDescription('文章、音乐、上传接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  (globalThis as any).__openapi_document = document;

  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  console.log(`后端运行在: http://localhost:${port}`);
  console.log(`API 文档:   http://localhost:${port}/docs.html`);
}
bootstrap();
