# 江西财经大学 — 数智技术协会

![GitHub last commit](https://img.shields.io/github/last-commit/jxufe-tech/jxufe-tech-web?style=flat-square)

协会官网 + 无头 CMS 后端的 Monorepo 项目。

> **线上地址：** [www.jxufe-tech.top](https://www.jxufe-tech.top)

---

## 📁 项目结构

```
jxufe-tech/
├── frontend/          # Vue 3 前端 — 协会官网 (SSG via vite-ssg)
│   ├── src/
│   │   ├── views/     # 页面组件（含 /news/:id 文章详情，构建时预渲染）
│   │   ├── components/# 公共组件
│   │   ├── composables# 组合式函数
│   │   ├── i18n/      # 国际化 (中/英)
│   │   └── api/       # CMS API 客户端
│   ├── public/        # 静态资源
│   ├── index.html
│   └── vite.config.ts
├── backend/           # NestJS 后端 — 无头 CMS
│   ├── src/
│   │   ├── auth/      # 认证 (JWT) + 登录限流
│   │   ├── articles/  # 文章管理（变更后自动触发前端 SSG 重建）
│   │   ├── chat/      # AI 对话（每日预算、会话历史、反滥用）
│   │   ├── upload/    # 文件上传（magic bytes 校验）
│   │   ├── migrations # TypeORM 数据库迁移
│   │   └── rebuild/   # 触发前端重建
│   ├── public/        # 上传的静态资源
│   └── dist/          # 构建产物
├── .github/workflows/ # GitHub Actions 部署与重建
├── ecosystem.config.js# PM2 配置
└── package.json       # 根依赖清单（npm ci）
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
npm ci

# 3. 配置后端环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 JWT_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD / DEEPSEEK_API_KEY

# 4. 同时启动前后端
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

### 构建与校验

```bash
npm run build          # 前端 SSG + 后端编译
npm test               # 单元测试
npm run test:e2e       # E2E 测试
npm run lint           # 后端 ESLint（只检查）
npx vue-tsc --noEmit -p frontend/tsconfig.json   # 前端类型检查
```

## 🔐 安全与运维

### 环境变量（backend/.env，不入库）

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥（AI 对话必需） |
| `JWT_SECRET` | JWT 签名密钥，生产环境 ≥ 32 字符 |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 管理员账号，密码 ≥ 8 字符；生产必须设置 |
| `TRUST_PROXY` | 反向代理层数（默认 1，控制 `req.ip`） |
| `AI_DAILY_REQUEST_LIMIT` | AI 每日请求上限（默认 200） |
| `AI_DAILY_TOKEN_BUDGET` | AI 每日 token 预算（默认 200k） |
| `GITHUB_REBUILD_TOKEN` | 触发前端重建的 GitHub PAT（可选） |

### 管理员密码重置

仅修改 `.env` 不会更新已创建的旧账号密码：

```bash
npm run reset:admin
```

### 数据库迁移与备份

- 生产环境关闭 `synchronize`，结构变更走 TypeORM migration：
  ```bash
  npm run migration:run
  ```
- 备份（定时 cron）：
  ```bash
  # 冷备份 SQLite
  sqlite3 /www/wwwroot/jxufe-tech/backend/data.db ".backup /backups/data-$(date +%F).db"
  ```

### AI 费用防护

- 聊天接口只接收"本次用户输入"，System Prompt 在后端，客户端无法提交 system 角色
- 每条消息 ≤ 2000 字，历史由后端组装（≤ 10 轮 / 12000 字）
- 每日请求数与 token 预算超额后自动关闭聊天（次日恢复）
- 登录 / 聊天 / 令牌接口均有 IP 限流；伪造 `X-Forwarded-For` 无法绕过（`trust proxy` + `req.ip`）
- 多实例部署时可将限流/会话存储替换为 Redis（当前单机内存实现）

### 前端 SSG 重建

CMS 文章增删改后，需要重新构建前端以预渲染新的 `/news/:id` 页面：

- 后端已配置 `GITHUB_REBUILD_TOKEN` 时自动触发 `.github/workflows/rebuild.yml`
- 也可在 GitHub Actions 手动触发 `Rebuild Frontend (SSG)` workflow
- 或调用受保护接口 `POST /api/rebuild`

## 🛠 技术栈

### 前端
- **Vue 3** (SSG via vite-ssg，`/news/:id` 构建时抓取 CMS 预渲染)
- **Vite** (Rolldown)
- **Tailwind CSS v4**
- **vue-i18n** 国际化
- **Markdown** 内容渲染（安全配置：禁用原始 HTML + 链接协议白名单）

### 后端
- **NestJS 11**
- **TypeORM** + better-sqlite3（生产关闭 synchronize，走 migration）
- **JWT** 认证 + 登录限流
- **Swagger** API 文档
- **Multer** 文件上传（magic bytes 校验，服务端生成文件名）
- **Helmet** 安全响应头 / CSP

---
