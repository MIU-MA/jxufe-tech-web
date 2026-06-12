import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { MusicModule } from './music/music.module';
import { UploadController } from './upload/upload.controller';
import { Article } from './articles/entities/article.entity';
import { Music } from './music/entities/music.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data.db',
      autoLoadEntities: true, // 自动加载实体
      synchronize: true,      // 自动建表（开发利器）
    }),
    TypeOrmModule.forFeature([Article, Music]), // UploadController 注入
    AuthModule,
    ArticlesModule,
    MusicModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
