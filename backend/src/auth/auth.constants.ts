/**
 * 认证相关常量。
 */

/**
 * bcrypt cost factor。
 * 12 rounds 在现代硬件上约 250ms/次，兼顾安全与登录响应。
 * 旧值为 10，已统一提升；已有 10-rounds 哈希仍可被 bcrypt.compare
 * 正常验证（rounds 嵌在哈希串里，自适应），改密后升级为 12。
 */
export const BCRYPT_ROUNDS = 12;

/**
 * 默认管理员口令（仅在未配置 ADMIN_PASSWORD 环境变量时使用）。
 * 公开已知，属弱口令 -- 生产环境务必通过环境变量覆盖。
 */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';
