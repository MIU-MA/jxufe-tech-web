# GitHub Actions 自动部署

push 到 `main` 分支后自动构建、测试并部署前后端到宝塔服务器。

## 流程

1. 根目录 `npm ci` 装依赖
2. 构建：前端 SSG（构建时从 `www.jxufe-tech.top` 抓文章，预渲染 `/news/:id`）+ 后端 NestJS 编译
3. 校验，任一失败就中断、不上线：
   - 后端单测 `npm test -- --runInBand`
   - 前端类型检查 `npx vue-tsc --noEmit -p frontend/tsconfig.json`
   - 后端 lint `cd backend && npx eslint "{src,test}/**/*.ts"`（只检查，不自动改）
4. 把产物 scp 到服务器：
   - `frontend/dist/**` → `/www/wwwroot/jxufe-tech/frontend`（`strip_components: 2`，SSG 产物直接落在 frontend 根目录，nginx root 指向它）
   - `backend/dist/**` → `/www/wwwroot/jxufe-tech/backend`（`strip_components: 1`，保留 `dist/` 层级，落盘 `backend/dist/main.js`，对应 `ecosystem.config.js` 里的 `script: 'dist/main.js'`）
   - 根 `package.json` / `package-lock.json` / `ecosystem.config.js` → `/www/wwwroot/jxufe-tech`
5. 服务器上 `npm ci --omit=dev` 装生产依赖，然后 `pm2 startOrReload ecosystem.config.js --update-env` 重载后端

`backend/.env` 不随部署上传，由服务器单独维护，部署不会覆盖它。

## 首次配置

### 服务器

```bash
npm install -g pm2        # 需要 Node.js ≥ 22
mkdir -p /www/wwwroot/jxufe-tech
```

### 服务器维护 `.env`

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

密钥多的话也可以用 ECS 的密钥注入，把变量作为进程环境变量注入，`.env` 就不需要了。

### Nginx

```nginx
server {
    listen 443 ssl;
    server_name www.jxufe-tech.top;
    # ...ssl 证书...

    root /www/wwwroot/jxufe-tech/frontend;   # SSG 静态文件
    index index.html;

    # API 反代到后端。AI 对话是 SSE 流，必须关掉缓冲
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

    # SSG 页面：命中文件返回文件，否则回退 index.html
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

> 后端 `TRUST_PROXY=1`，按一层 nginx 解析 `req.ip`，忽略客户端伪造的 `X-Forwarded-For`（登录/聊天限流用）。

### SSH 密钥 + GitHub Secrets

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions   # 全部复制
```

仓库 Settings → Secrets and variables → Actions，新建两个 secret：

| Secret | 值 |
|---|---|
| `SERVER_IP` | 服务器 IP |
| `SERVER_SSH_KEY` | 上面复制的内容 |

## 首次部署

先手动跑一次，把目录和依赖备好：

```bash
cd /www/wwwroot/jxufe-tech
mkdir -p backend/public/uploads
npm ci --omit=dev
pm2 startOrReload ecosystem.config.js --update-env
pm2 save
```

之后 push 到 main 就自动部署了。

## 验证

1. `git push origin main`
2. GitHub → Actions 标签页看运行状态
3. 打开 `https://www.jxufe-tech.top` 看首页
4. `https://www.jxufe-tech.top/api/health` 应返回 JSON
