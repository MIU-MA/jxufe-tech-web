module.exports = {
  apps: [
    {
      name: 'jxufe-backend',
      script: 'dist/main.js',
      cwd: '/www/wwwroot/jxufe-tech/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        // JWT_SECRET 必须在部署环境显式设置（.env 或 shell 环境变量）
        // 不再提供弱默认回退 -- 缺失时应用会拒绝启动
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
      },
    },
  ],
}
