import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

/**
 * 数据库种子服务 —— 应用启动时自动执行。
 * 如果 users 表为空，自动创建默认管理员账号。
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count > 0) {
      console.log(`[Seed] 已有 ${count} 个用户，跳过初始化`);
      return;
    }

    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = this.userRepo.create({
      username: defaultUsername,
      password: hashedPassword,
    });
    await this.userRepo.save(admin);

    console.log('══════════════════════════════════════════');
    console.log('  🔐 默认管理员账号已创建');
    console.log(`  用户名: ${defaultUsername}`);
    console.log(`  密码:   ${defaultPassword}`);
    console.log('  请登录后立即修改密码！');
    console.log('══════════════════════════════════════════');
  }
}
