import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ArticlesModule } from "./articles/articles.module";
import { ChatModule } from "./chat/chat.module";
import { UploadController } from "./upload/upload.controller";
import { RebuildModule } from "./rebuild/rebuild.module";
import { Article } from "./articles/entities/article.entity";
import { join } from "path";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: process.env.DB_PATH ?? "data.db",
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== "production",
      migrations: [join(__dirname, "migrations", "*")],
      migrationsRun: process.env.NODE_ENV === "production",
    }),
    TypeOrmModule.forFeature([Article]),
    AuthModule,
    ArticlesModule,
    ChatModule,
    RebuildModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
