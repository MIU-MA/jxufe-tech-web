module.exports = {
  apps: [
    {
      name: 'jxufe-backend',
      script: 'dist/main.js',
      cwd: '/www/wwwroot/jxufe-tech/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        JWT_SECRET: process.env.JWT_SECRET || 'change-me-to-a-random-string',
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
      },
    },
  ],
}
