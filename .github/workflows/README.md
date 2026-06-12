# GitHub Actions 自动部署说明

每次 `git push` 到 `main` 分支，自动编译前后端并部署到宝塔服务器。

## 工作流做了什么

1. checkout 代码
2. `npm ci` + `npm run build`（前端 SSG + 后端 NestJS 编译）
3. 把 `frontend/dist/`、`backend/dist/`、`backend/package.json`、`ecosystem.config.js` 传到服务器
4. SSH 远程 `npm install --production` + `pm2 restart`

## 使用前配置

### 1. 服务器准备

```bash
# 安装 Node.js ≥ 22
# 安装 PM2
npm install -g pm2

# 创建项目目录
mkdir -p /www/wwwroot/jxufe-tech

# 配置 Nginx（前端静态文件 + API 反向代理）
```

### 2. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name www.jxufe-tech.top;

    # 前端静态文件
    root /www/wwwroot/jxufe-tech/frontend/dist;
    index index.html;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件
    location /uploads/ {
        alias /www/wwwroot/jxufe-tech/backend/public/uploads/;
    }

    location /music/ {
        alias /www/wwwroot/jxufe-tech/backend/public/music/;
    }

    # SPA fallback（SSG 不需要，但保留无副作用）
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

### 3. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions   # 复制全部内容
```

### 4. 设置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions → New repository secret：

| Secret 名 | 值 |
|-----------|-----|
| `SERVER_IP` | 服务器 IP |
| `SERVER_SSH_KEY` | `~/.ssh/github-actions` 的完整内容 |

### 5. 修改生产密钥

编辑 `ecosystem.config.js`，把 `JWT_SECRET` 改成随机字符串：

```bash
openssl rand -hex 32
```

## 首次部署

```bash
# 在服务器上手动跑一次，确保目录存在
cd /www/wwwroot/jxufe-tech/backend
mkdir -p public/uploads public/music
npm install --production
```

之后推代码到 `main` 就会自动部署。

## 验证

1. `git push origin main`
2. GitHub → Actions 标签页查看运行状态
3. 成功后访问 `https://www.jxufe-tech.top` 看首页是否正常
4. 访问 `https://www.jxufe-tech.top/api/articles` 看 API 是否返回 JSON
