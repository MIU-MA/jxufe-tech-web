// CORS 与 OriginGuard 共用；精确匹配，禁止 startsWith（防止前缀伪造绕过）
export const ALLOWED_ORIGINS: readonly string[] = [
  "https://www.jxufe-tech.top",
  "https://jxufe-tech.top",
  "https://api.jxufe-tech.top",
  "https://miuma-blog.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export const ALLOWED_ORIGIN_SET: ReadonlySet<string> = new Set(ALLOWED_ORIGINS);
