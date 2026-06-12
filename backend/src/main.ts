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

  // 2. 静态资源 (图片、音乐、api-docs.html)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 3. OpenAPI 文档 JSON
  const config = new DocumentBuilder()
    .setTitle('博客后台 API')
    .setDescription('文章、音乐、上传接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // 注入到全局，AppController 返回给 /api-json
  (globalThis as any).__openapi_document = document;

  await app.listen(3003);
  console.log('后端运行在: http://localhost:3003');
  console.log('API 文档:   http://localhost:3003/docs.html');
}
bootstrap();
