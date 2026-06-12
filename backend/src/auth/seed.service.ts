import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

/**
 * 数据库种子服务 —— 应用启动时自动执行。
 * - SQLite 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS，手动补列
 * - 首次运行时创建默认管理员账号
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * 检查并补全 SQLite 表缺失的列
   * TypeORM synchronize: true 只建表不补列，生产环境需要这个
   */
  private async syncColumns() {
    const needed: Record<string, { col: string; def: string }[]> = {
      articles: [
        { col: 'summary',     def: 'TEXT' },
        { col: 'publishedAt', def: 'datetime' },
      ],
    };

    for (const [table, columns] of Object.entries(needed)) {
      const rows: { name: string }[] = await this.dataSource.query(
        `PRAGMA table_info("${table}")`,
      );
      const existing = new Set(rows.map((r) => r.name));

      for (const { col, def } of columns) {
        if (!existing.has(col)) {
          await this.dataSource.query(
            `ALTER TABLE "${table}" ADD COLUMN "${col}" ${def}`,
          );
          console.log(`[Seed] ✅ ${table}.${col} 列已添加`);
        }
      }
    }
  }

  async onModuleInit() {
    // 1. SQLite 表结构自动同步
    await this.syncColumns();

    // 2. 创建默认管理员
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
