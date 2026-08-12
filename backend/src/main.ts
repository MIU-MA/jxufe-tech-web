import { loadEnv, assertSecretsOrExit } from "./common/env.config";

loadEnv();
assertSecretsOrExit();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { join } from "path";
import { ALLOWED_ORIGINS } from "./common/origins";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // trust proxy 让 req.ip 取 Nginx 追加的 X-Forwarded-For，客户端伪造无效
  app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: ALLOWED_ORIGINS as unknown as boolean | string | string[],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, "..", "public"));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("博客后台 API")
    .setDescription("文章、音乐、上传接口文档")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  (globalThis as { __openapi_document?: unknown }).__openapi_document =
    document;

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`后端运行在: http://localhost:${port}`);
  console.log(`API 文档:   http://localhost:${port}/docs.html`);
}
void bootstrap();
