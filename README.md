<<<<<<< HEAD
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

=======
# 欢迎新生饱饱们先从简单的vue3开始上手
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jxufe-tech/jxufe-tech-web)
![GitHub last commit](https://img.shields.io/github/last-commit/jxufe-tech/jxufe-tech-web?style=flat-square)

>[!NOTE]
>
>## 项目运行
>1. 克隆项目：`git clone https://github.com/jxufe-tech/jxufe-tech-web.git`
>2. 安装依赖：`npm install`
>3. 本地开发：`npm run dev`
>4. 还是直接fork吧

## 技术栈
- Vue 3 (Vite)
- Tailwind CSS v4 (排版美化)
- Markdown (静态文章更新)

协会网址→：www.jxufe-tech.top

~~一点碎碎念~~

~~此项目是本人断断续续,囫囵吞枣的产物（甚至写的时候vue3都还没学完），因此代码极其的混乱+风格不统一。很多组件都是从网上扒的，
不过最近总算能抽出时间来不断优化代码+填补自己留下的坑了，希望大佬们看到史山代码不要惊讶，我会不断改进的🥺🥺~~
>>>>>>> upstream/test
