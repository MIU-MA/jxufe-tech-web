# 江西财经大学 — 数智技术协会 (DSA)

![GitHub last commit](https://img.shields.io/github/last-commit/jxufe-tech/jxufe-tech-web?style=flat-square)

协会官网 + 无头 CMS 后端的 Monorepo 项目。

> **线上地址：** [www.jxufe-tech.top](https://www.jxufe-tech.top)

---

## 📁 项目结构

```
jxufe-tech/
├── frontend/          # Vue 3 前端 — 协会官网 (SSG)
│   ├── src/
│   │   ├── views/     # 页面组件
│   │   ├── components/# 公共组件
│   │   ├── articles/  # Markdown 静态文章
│   │   ├── locales/   # 国际化 (中/英)
│   │   └── data/      # 静态数据
│   └── vite.config.ts
├── backend/           # NestJS 后端 — 无头 CMS
│   ├── src/
│   │   ├── auth/      # 认证 (JWT)
│   │   ├── articles/  # 文章管理
│   │   ├── music/     # 音乐管理
│   │   └── upload/    # 文件上传
│   └── public/        # 静态资源
└── package.json       # 根 workspace 配置
```

## 🚀 快速开始

### 环境要求
- Node.js ≥ 20
- npm ≥ 10

### 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/jxufe-tech/jxufe-tech-web.git
cd jxufe-tech-web

# 2. 安装所有依赖
npm install

# 3. 同时启动前后端
npm run dev
```

启动后：
| 服务 | 地址 |
|------|------|
| 前端 (Vite) | http://localhost:5173 |
| 后端 API | http://localhost:3003 |
| API 文档 | http://localhost:3003/docs.html |

### 分别启动

```bash
# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend
```

### 构建部署

```bash
npm run build
```

## 🛠 技术栈

### 前端
- **Vue 3** (SSG via vite-ssg)
- **Vite** (Rolldown)
- **Tailwind CSS v4**
- **vue-i18n** 国际化
- **Markdown** 静态内容

### 后端
- **NestJS 11**
- **TypeORM** + better-sqlite3
- **JWT** 认证
- **Swagger** API 文档
- **Multer** 文件上传

---

