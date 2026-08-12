import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { BCRYPT_ROUNDS } from "./auth.constants";

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count === 0) {
      await this.createInitialAdmin();
    }
  }

  private async createInitialAdmin() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      console.error("══════════════════════════════════════════");
      console.error(
        "  🚨 数据库为空，且未设置 ADMIN_USERNAME / ADMIN_PASSWORD",
      );
      console.error("     为避免创建公开已知的默认账号，服务拒绝启动。");
      console.error(
        "     请在 backend/.env 或环境变量中配置（密码 >= 8 字符）。",
      );
      console.error("══════════════════════════════════════════");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const admin = this.userRepo.create({ username, password: hashedPassword });
    await this.userRepo.save(admin);

    console.log("══════════════════════════════════════════");
    console.log("  🔐 管理员账号已创建");
    console.log(`  用户名: ${username}`);
    console.log("  密码:   (来自 ADMIN_PASSWORD 环境变量，已隐藏)");
    console.log("  密码已 bcrypt 加盐哈希存储，数据库无明文");
    console.log("══════════════════════════════════════════");
  }
}
