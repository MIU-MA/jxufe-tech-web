module.exports = {
  apps: [
    {
      name: 'jxufe-backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        JWT_SECRET: process.env.JWT_SECRET || 'change-me-to-a-random-string',
      },
    },
  ],
}
