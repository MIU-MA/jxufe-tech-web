import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticlesService } from "./articles.service";
import { ArticlesController } from "./articles.controller";
import { Article } from "./entities/article.entity";
import { RebuildModule } from "../rebuild/rebuild.module";

@Module({
  imports: [TypeOrmModule.forFeature([Article]), RebuildModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
