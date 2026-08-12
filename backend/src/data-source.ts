import "reflect-metadata";
import { DataSource } from "typeorm";
import { resolve } from "path";
import { loadEnv } from "./common/env.config";
import { resolveDbPath } from "./common/db-path";
import { Article } from "./articles/entities/article.entity";
import { User } from "./auth/entities/user.entity";
import { AiUsage } from "./chat/entities/ai-usage.entity";

loadEnv();

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: resolveDbPath(),
  entities: [Article, User, AiUsage],
  migrations: [resolve(__dirname, "migrations", "*")],
  synchronize: false,
});
