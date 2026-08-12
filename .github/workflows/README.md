# GitHub Actions 自动部署说明

每次 `git push` 到 `main` 分支，自动构建、校验并部署前后端到宝塔服务器。

## 工作流做了什么

1. checkout 代码
2. **从仓库根目录** `npm ci`（单一依赖安装，锁定版本）
3. 构建：前端 SSG（`VITE_SSG_API_BASE` 指向线上 API 抓取文章）+ 后端 NestJS 编译
4. 校验闸门（**任一失败即停止上线**）：
   - `npm test -- --runInBand`（单元测试）
   - `npx vue-tsc --noEmit -p frontend/tsconfig.json`（前端类型检查）
   - `cd backend && npx eslint "{src,test}/**/*.ts"`（后端 Lint，只检查不自动修改）
5. 部署产物到服务器：
   - `frontend/dist/**` → `/www/wwwroot/jxufe-tech/frontend`
   - `backend/dist/**` → `/www/wwwroot/jxufe-tech/backend`
   - 根目录 `package.json`、`package-lock.json`、`ecosystem.config.js` → `/www/wwwroot/jxufe-tech`
   - **不部署 `backend/.env`**：敏感配置由服务器单独维护（详见下）
6. 服务器端在仓库根执行 `npm ci --omit=dev`，再 `pm2 restart`

## 使用前配置

### 1. 服务器准备

```bash
# 安装 Node.js ≥ 22 与 PM2
npm install -g pm2

# 创建项目目录
mkdir -p /www/wwwroot/jxufe-tech

# 配置 Nginx（前端静态文件 + API 反向代理，见下方示例）
```

### 2. 服务器维护 `.env`（不入库）

`backend/.env` **不随 Git 部署**，请在服务器手动创建（部署不会覆盖）：

```bash
cd /www/wwwroot/jxufe-tech/backend
cat > .env <<'EOF'
DEEPSEEK_API_KEY=sk-你的密钥
JWT_SECRET=替换为随机串
ADMIN_USERNAME=admin
ADMIN_PASSWORD=替换为强密码（>=8 字符）
EOF
chmod 600 .env
```

> 提示：更推荐用 ECS / 云平台的密钥注入，把上述变量作为进程环境变量注入，
> 这样 `.env` 甚至可以不需要。

### 3. Nginx 配置示例

```nginx
server {
    listen 443 ssl;
    server_name www.jxufe-tech.top;
    # ... ssl 证书配置 ...

    # 前端静态文件（SSG 产物）
    root /www/wwwroot/jxufe-tech/frontend/dist;
    index index.html;

    # API 反向代理（SSE 必须关闭缓冲）
    location /api/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache off;
    }

    # 上传文件
    location /uploads/ {
        alias /www/wwwroot/jxufe-tech/backend/public/uploads/;
    }

    # SSG 页面：命中文件则返回，否则回退 index.html
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

> 说明：后端按 `TRUST_PROXY=1`（一层 Nginx）解析 `req.ip`，
> 忽略客户端伪造的 `X-Forwarded-For`，用于登录/聊天限流。

### 4. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions   # 复制全部内容
```

### 5. 设置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions → New repository secret：

| Secret 名 | 值 |
|-----------|-----|
| `SERVER_IP` | 服务器 IP |
| `SERVER_SSH_KEY` | `~/.ssh/github-actions` 的完整内容 |

## 首次部署

```bash
# 在服务器上手动跑一次，确保目录与依赖就绪
cd /www/wwwroot/jxufe-tech
mkdir -p backend/public/uploads
npm ci --omit=dev
pm2 start backend/ecosystem.config.js
pm2 save
```

之后推代码到 `main` 就会自动部署。

## 验证

1. `git push origin main`
2. GitHub → Actions 标签页查看运行状态
3. 成功后访问 `https://www.jxufe-tech.top` 看首页是否正常
4. 访问 `https://www.jxufe-tech.top/api/health` 看健康检查是否返回 JSON
