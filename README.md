# 江西财经大学 — 数智技术协会

![GitHub last commit](https://img.shields.io/github/last-commit/jxufe-tech/jxufe-tech-web?style=flat-square)

## 关于协会

啊吧啊吧

## 关于项目

这是一个 Vue 3 前端 + NestJS 无头 CMS 后端的 Monorepo 项目。前端是构建时预渲染的静态站点（SSG），后端提供内容管理与 API。

**线上地址：** [www.jxufe-tech.top](https://www.jxufe-tech.top)

## 快速开始

需要 Node.js ≥ 20、npm ≥ 10。

```bash
git clone https://github.com/jxufe-tech/jxufe-tech-web.git
cd jxufe-tech-web
npm ci
cp backend/.env.example backend/.env   # 填入 JWT_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD / DEEPSEEK_API_KEY
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3003
- API 文档：http://localhost:3003/docs.html

## 技术栈

- 前端：Vue 3 · Vite · Tailwind CSS · vue-i18n
- 后端：NestJS · TypeORM · SQLite · JWT
