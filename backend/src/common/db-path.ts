import { resolve } from "path";

// 统一的数据库路径：基于 __dirname 解析到 backend/data.db，与启动目录无关。
// 应用、TypeORM CLI 迁移、reset-admin 共用同一默认值，避免产生多个 data.db。
export function resolveDbPath(): string {
  return process.env.DB_PATH || resolve(__dirname, "..", "..", "data.db");
}
