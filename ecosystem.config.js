module.exports = {
  apps: [
    {
      name: 'jxufe-backend',
      script: 'dist/main.js',
      cwd: '/www/wwwroot/jxufe-tech/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        // 敏感配置（JWT_SECRET / ADMIN_PASSWORD / DEEPSEEK_API_KEY 等）
        // 一律由服务器侧的 backend/.env 或 shell 环境变量提供，
        // 不写入本文件、不随 Git 仓库部署（见 .github/workflows/deploy.yml）。
        // 缺失关键密钥时应用会拒绝启动（安全加固策略）。
        TRUST_PROXY: process.env.TRUST_PROXY || '1',
      },
    },
  ],
}
