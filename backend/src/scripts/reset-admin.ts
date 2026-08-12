import "reflect-metadata";
import { loadEnv } from "../common/env.config";
import { resolveDbPath } from "../common/db-path";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../auth/entities/user.entity";
import { BCRYPT_ROUNDS } from "../auth/auth.constants";

loadEnv();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      "❌ 需要 ADMIN_USERNAME 与 ADMIN_PASSWORD 环境变量（backend/.env 或环境变量）",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error(
      `❌ ADMIN_PASSWORD 长度必须至少为 8（当前 ${password.length}）`,
    );
    process.exit(1);
  }

  const database = resolveDbPath();

  const dataSource = new DataSource({
    type: "better-sqlite3",
    database,
    entities: [User],
    synchronize: false,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user = await userRepo.findOne({ where: { username } });
  if (user) {
    user.password = hash;
    await userRepo.save(user);
    console.log(`✅ 管理员 "${username}" 密码已重置（bcrypt 哈希已更新）`);
  } else {
    user = userRepo.create({ username, password: hash });
    await userRepo.save(user);
    console.log(`✅ 管理员 "${username}" 不存在，已创建新账号`);
  }

  await dataSource.destroy();
}

main().catch((err) => {
  console.error("❌ 重置失败:", err);
  process.exit(1);
});
