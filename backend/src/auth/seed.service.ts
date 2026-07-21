import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import {
  BCRYPT_ROUNDS,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
} from './auth.constants';

/**
 * 数据库种子服务 -- 应用启动时自动执行。
 * - SQLite 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS，手动补列
 * - 首次运行时创建管理员账号：环境变量优先，未配置则回退默认弱口令
 * - 启动时检测是否仍有账号使用公开已知弱口令，持续警告
 *
 * 密码安全：无论来源（环境变量或默认值），入库前一律 bcrypt 加盐哈希，
 * 数据库永不存明文。登录时用 bcrypt.compare 比对哈希。
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

  /**
   * 检测是否仍有账号使用公开已知的默认弱口令，是则持续警告。
   * 覆盖"建号时未设环境变量"和"至今未改密"两种情况。
   * 只比对已知默认弱口令，不泄露其他信息。
   */
  private async warnIfWeakPassword() {
    const users = await this.userRepo.find();
    for (const user of users) {
      const isWeak = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, user.password);
      if (isWeak) {
        console.log('══════════════════════════════════════════');
        console.log('  🚨 安全警告：检测到弱口令');
        console.log(`  账号 "${user.username}" 仍在使用默认密码 ${DEFAULT_ADMIN_PASSWORD}`);
        console.log('  该口令公开已知，任何人都能登录后台！');
        console.log('  请设置 ADMIN_PASSWORD 环境变量后重建，或尽快修改密码');
        console.log('══════════════════════════════════════════');
      }
    }
  }

  async onModuleInit() {
    // 1. SQLite 表结构自动同步
    await this.syncColumns();

    // 2. 创建管理员（仅首次，数据库无用户时）
    const count = await this.userRepo.count();
    if (count === 0) {
      // 环境变量优先：支持 .env 文件或 ECS 等云环境变量注入
      // 未配置则回退默认弱口令（向后兼容现有部署，但会警告）
      const username = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
      const isDefault = !process.env.ADMIN_PASSWORD;

      // 入库前一律 bcrypt 加盐哈希，永不存明文
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const admin = this.userRepo.create({ username, password: hashedPassword });
      await this.userRepo.save(admin);

      console.log('══════════════════════════════════════════');
      console.log('  🔐 管理员账号已创建');
      console.log(`  用户名: ${username}`);
      if (isDefault) {
        console.log(`  密码:   ${password}`);
        console.log('  ⚠️  使用默认弱口令（未配置 ADMIN_PASSWORD 环境变量）');
        console.log('     生产环境请在 .env 或环境变量中设置 ADMIN_PASSWORD');
      } else {
        console.log('  密码:   (来自 ADMIN_PASSWORD 环境变量，已隐藏)');
      }
      console.log('  密码已 bcrypt 加盐哈希存储，数据库无明文');
      console.log('══════════════════════════════════════════');
    } else {
      console.log(`[Seed] 已有 ${count} 个用户，跳过初始化`);
    }

    // 3. 无论是否新建，都检测弱口令并警告
    await this.warnIfWeakPassword();
  }
}
