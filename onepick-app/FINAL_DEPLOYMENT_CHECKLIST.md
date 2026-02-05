# ✅ 最终部署检查清单

## 🎯 项目状态

✅ 所有功能已完成：
- [x] Landing Page（主页）
- [x] Hall of Fame（荣誉殿堂）
- [x] 投票页面
- [x] 查询页面
- [x] 修改页面
- [x] 订单号验证（带日期和"04"固定位）
- [x] Bug 修复（pid 重复插入）
- [x] 所有 API 路由

---

## 🚀 部署步骤（3选1）

### 方案1：Vercel CLI（最快）⚡

```bash
# 1. 解压项目
tar -xzf onepick-fixed.tar.gz
cd onepick-app

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，添加：
# DATABASE_URL="postgresql://..."

# 4. 本地测试（可选）
npm run dev
# 访问 http://localhost:3000 测试

# 5. 安装 Vercel CLI
npm i -g vercel

# 6. 登录
vercel login

# 7. 部署到生产环境
vercel --prod

# 8. 配置生产环境变量
vercel env add DATABASE_URL production
# 粘贴你的 Neon 数据库连接字符串

# 9. 重新部署（应用环境变量）
vercel --prod
```

---

### 方案2：GitHub + Vercel（推荐）⭐

```bash
# 1. 解压项目
tar -xzf onepick-fixed.tar.gz
cd onepick-app

# 2. 初始化 Git
git init
git add .
git commit -m "Initial commit - One-Pick voting system"

# 3. 推送到 GitHub
# 在 GitHub 创建新仓库：onepick-app
git remote add origin https://github.com/你的用户名/onepick-app.git
git branch -M main
git push -u origin main

# 4. 在 Vercel 部署
# 访问 https://vercel.com/new
# → Import Git Repository
# → 选择你的仓库
# → 添加环境变量：DATABASE_URL
# → Deploy
```

---

### 方案3：Vercel Web UI（最简单）🌐

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 点击 "Upload" 标签
4. 拖放 `onepick-app` 文件夹
5. 添加环境变量：
   - Name: `DATABASE_URL`
   - Value: 你的 Neon 连接字符串
6. 点击 "Deploy"

---

## 🗄️ 数据库设置（必须！）

### 1. 创建 Neon 数据库

访问：https://neon.tech

1. 注册/登录
2. 创建新项目：`onepick`
3. 选择区域（建议：离用户近的）
4. 复制连接字符串

**连接字符串格式**：
```
postgresql://user:password@host/database?sslmode=require
```

---

### 2. 创建数据库表

在 Neon Dashboard → SQL Editor 中执行：

```sql
-- 1. 季度表
CREATE TABLE one_pick_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 订单绑定表
CREATE TABLE order_bindings (
  pid UUID NOT NULL UNIQUE,
  order_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (pid, order_id)
);

-- 3. 投票表
CREATE TABLE one_pick_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES one_pick_seasons(id),
  order_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'frozen', 'invalid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (season_id, order_id)
);

-- 4. 修改密钥表
CREATE TABLE change_keys (
  order_id TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES one_pick_seasons(id),
  key_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (order_id, season_id)
);

-- 5. 修改日志表
CREATE TABLE one_pick_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pid UUID NOT NULL,
  order_id TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES one_pick_seasons(id),
  from_candidate_id TEXT,
  to_candidate_id TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引（性能优化）
CREATE INDEX idx_votes_season ON one_pick_votes(season_id);
CREATE INDEX idx_votes_order ON one_pick_votes(order_id);
CREATE INDEX idx_votes_candidate ON one_pick_votes(candidate_id);
CREATE INDEX idx_change_logs_season ON one_pick_change_logs(season_id);
```

---

### 3. 添加初始数据

```sql
-- 添加当前季度（2026 Q1）
INSERT INTO one_pick_seasons (id, name, start_at, end_at, status)
VALUES (
  gen_random_uuid(),
  '2026 Q1',
  '2026-01-01 00:00:00+00',
  '2026-03-31 23:59:59+00',
  'active'
);

-- 验证插入成功
SELECT * FROM one_pick_seasons;
```

---

## 🔧 环境变量配置

### Vercel 环境变量

**必需变量**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Neon 数据库连接字符串 |

**配置方式**：

**Web UI**：
```
项目 → Settings → Environment Variables
→ Add New
→ Name: DATABASE_URL
→ Value: postgresql://...
→ Environments: Production, Preview, Development (全选)
```

**CLI**：
```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

---

## ✅ 部署后验证

### 1. 访问网站

```
https://你的项目名.vercel.app
```

**应该看到**：
- ✅ 美丽的 Landing Page
- ✅ "开始投票" 和 "查看榜单" 两个卡片
- ✅ 流畅的动画效果

---

### 2. 测试 API

```bash
# 获取季度列表
curl https://你的项目名.vercel.app/api/one-pick/seasons

# 应该返回：
# {
#   "success": true,
#   "data": {
#     "current": { ... },
#     "all": [ ... ]
#   }
# }
```

---

### 3. 测试完整流程

#### A. 投票流程

1. 访问首页 → 点击 "开始投票"
2. 输入测试订单号：`TF260205041478489`
3. 选择候选人 → 提交
4. **应该成功** → 显示密钥保存页面
5. 记下密钥

#### B. 查询流程

1. 访问首页 → 点击底部 "查询我的投票"
2. 输入订单号：`TF260205041478489`
3. **应该看到** → 投票记录

#### C. Hall of Fame

1. 访问首页 → 点击 "查看榜单"
2. **应该看到** → 深色主题的荣誉殿堂
3. **应该看到** → 金色星光效果
4. **应该看到** → 你刚才投的那一票

---

### 4. 测试订单号验证

```bash
# 测试：固定位错误
curl -X POST https://你的项目名.vercel.app/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{"orderId": "TF260205001478489", "candidateId": "lisa"}'

# 应该返回错误：
# { "success": false, "error": { "message": "订单号格式错误" } }
```

```bash
# 测试：未来日期
curl -X POST https://你的项目名.vercel.app/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{"orderId": "TF270205041478489", "candidateId": "lisa"}'

# 应该返回错误：
# { "success": false, "error": { "message": "订单日期无效（未来日期）" } }
```

---

## 🐛 故障排除

### 问题1：Build 失败

**症状**：部署时构建失败

**解决**：
```bash
# 本地测试构建
npm run build

# 检查错误信息
# 修复后重新部署
```

---

### 问题2：数据库连接失败

**症状**：API 返回 500 错误

**检查**：
1. Vercel 环境变量是否设置
2. Neon 数据库是否在线
3. 连接字符串格式是否正确

**验证连接字符串**：
```bash
# 在本地测试
DATABASE_URL="postgresql://..." npm run dev
```

---

### 问题3：投票失败

**症状**：提交投票返回错误

**检查**：
1. 数据库表是否创建
2. 季度数据是否添加
3. 订单号格式是否正确

**验证数据库**：
```sql
-- 检查表是否存在
\dt

-- 检查季度数据
SELECT * FROM one_pick_seasons;
```

---

### 问题4：Hall of Fame 无数据

**症状**：排行榜是空的

**原因**：还没有投票数据

**解决**：先进行几次投票测试

---

## 📊 监控和维护

### Vercel Dashboard

访问：https://vercel.com/dashboard

**可以查看**：
- 📊 Analytics（访问统计）
- 📝 Logs（实时日志）
- 🚀 Deployments（部署历史）
- ⚙️ Settings（项目设置）

---

### Neon Dashboard

访问：https://console.neon.tech

**可以查看**：
- 💾 Storage（存储使用量）
- 📈 Connections（连接数）
- 📝 Query（SQL 查询）
- 🔄 Backups（备份）

---

## 🎨 自定义配置

### 修改候选人列表

编辑：`lib/config/candidates.ts`

```typescript
export const CANDIDATES = [
  {
    id: 'lisa',
    name: 'Lisa',
    avatar: '/avatars/lisa.jpg',
    colors: { ... }
  },
  // 添加更多候选人
];
```

---

### 修改季度

在 Neon SQL Editor 中：

```sql
-- 添加新季度
INSERT INTO one_pick_seasons (name, start_at, end_at, status)
VALUES (
  '2026 Q2',
  '2026-04-01 00:00:00+00',
  '2026-06-30 23:59:59+00',
  'upcoming'
);

-- 关闭旧季度，开启新季度
UPDATE one_pick_seasons SET status = 'closed' WHERE name = '2026 Q1';
UPDATE one_pick_seasons SET status = 'active' WHERE name = '2026 Q2';
```

---

## 📱 域名配置（可选）

### 在 Vercel 添加自定义域名

1. Vercel → 项目 → Settings → Domains
2. 输入域名：`onepick.yourdomain.com`
3. 按照提示配置 DNS：

**在 Cloudflare 添加记录**：
```
Type: CNAME
Name: onepick
Target: cname.vercel-dns.com
```

4. 等待 DNS 生效（5-10分钟）

---

## 🎉 部署完成！

### 你现在拥有：

✅ 生产环境网站  
✅ 自动 HTTPS  
✅ 全球 CDN 加速  
✅ 自动扩容  
✅ 零运维成本  

### 下一步：

1. 📢 分享链接给用户
2. 📊 监控使用情况
3. 🔧 根据反馈优化
4. 🎨 自定义候选人和季度

---

## 📞 获取帮助

**遇到问题？**

1. 查看 Vercel Logs
2. 查看 Neon Dashboard
3. 检查浏览器控制台
4. 查看项目文档：
   - `VALIDATION_TESTS.md` - 验证测试
   - `BUG_FIX_DUPLICATE_PID.md` - Bug 修复
   - `PID_MECHANISM_EXPLAINED.md` - PID 机制
   - `DEPLOYMENT_CHECKLIST.md` - 本文档

---

## 🚀 准备好了吗？

选择一个部署方案，开始部署吧！

**推荐顺序**：
1. 先本地测试：`npm run dev`
2. 创建 Neon 数据库
3. 部署到 Vercel
4. 配置环境变量
5. 测试完整流程

**祝部署顺利！** 🎊
