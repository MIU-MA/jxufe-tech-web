import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 集中加载 backend/.env 到 process.env。
 * 在 main.ts 最早期调用，确保所有模块都能读到配置。
 *
 * 不引入 dotenv 依赖，沿用项目已有的手动解析方式（见 chat.service.ts）。
 * 已存在的 process.env 值优先，不覆盖（生产环境用真实环境变量）。
 */
export function loadEnv(): void {
  const envPath = resolve(__dirname, '../../.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env 不存在是正常的（生产环境用真实环境变量），静默跳过
  }
}

/**
 * 校验生产环境必需的密钥。
 * 缺失或使用已知弱值时，拒绝启动 —— 宁可启动失败，也不要用可预测的密钥上线。
 */
export function assertSecretsOrExit(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;

  // 已知的弱/占位值，无论环境都不该用
  const WEAK_VALUES = new Set([
    'secret-key-change-in-production',
    'change-me-to-a-random-string',
    'change-me',
    'secret',
  ]);

  const problems: string[] = [];

  if (!jwtSecret) {
    problems.push('JWT_SECRET 未设置');
  } else if (WEAK_VALUES.has(jwtSecret)) {
    problems.push(`JWT_SECRET 使用了已知占位值 "${jwtSecret}"`);
  } else if (isProd && jwtSecret.length < 32) {
    problems.push(`生产环境 JWT_SECRET 长度应 >= 32（当前 ${jwtSecret.length}）`);
  }

  if (problems.length === 0) return;

  console.error('══════════════════════════════════════════');
  console.error('  🚨 安全配置校验失败，拒绝启动');
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error('  请在 backend/.env 或环境变量中配置强随机 JWT_SECRET');
  console.error('══════════════════════════════════════════');
  process.exit(1);
}
