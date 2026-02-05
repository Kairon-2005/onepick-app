# OnePick - 季度 One-Pick 投票系统

一个以订单号为唯一凭证、按季度运行的 one-pick 投票系统。

## 特性

- ✅ 无登录、无截图
- ✅ 投票公开可查
- ✅ 可控修改（密钥轮换 + 季度限次）
- ✅ 部署极简（Vercel + Neon + Cloudflare）

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **数据库**: Neon Postgres + Drizzle ORM
- **部署**: Vercel + Cloudflare DNS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

然后填入你的 Neon 数据库连接字符串：

```env
DATABASE_URL=your_neon_postgres_connection_string
```

### 3. 推送数据库 Schema

```bash
npm run db:push
```

### 4. 初始化数据（可选）

```bash
npx tsx scripts/seed.ts
```

这会创建 2026 Q1 和 Q2 两个季度。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
onepick-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Phase 2)
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # 首页
├── lib/
│   ├── db/                # 数据库
│   │   ├── schema.ts      # Drizzle Schema
│   │   └── index.ts       # 数据库连接
│   ├── utils/             # 工具函数
│   │   ├── order.ts       # 订单号校验
│   │   ├── crypto.ts      # 密钥生成
│   │   ├── pid.ts         # PID 管理
│   │   └── season.ts      # 季度工具
│   └── config/
│       └── candidates.ts  # 候选人配置
├── scripts/
│   └── seed.ts            # 数据库初始化
└── package.json
```

## 数据模型

### 1. OnePickSeason (季度)
- `id`: UUID
- `name`: 季度名称（如 "2026 Q1"）
- `startAt`: 开始时间
- `endAt`: 结束时间
- `status`: 状态（upcoming/active/closed）

### 2. OrderBinding (订单绑定)
- `pid`: 匿名身份（UUID，唯一）
- `orderId`: 订单号（唯一）
- `createdAt`: 绑定时间

### 3. OnePickVote (投票记录)
- `id`: UUID
- `seasonId`: 季度 ID
- `orderId`: 订单号
- `candidateId`: 候选人 ID
- `status`: 状态（valid/frozen/invalid）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 4. ChangeKey (修改密钥)
- `orderId`: 订单号
- `seasonId`: 季度 ID
- `keyHash`: 密钥 hash
- `issuedAt`: 签发时间

### 5. OnePickChangeLog (修改日志)
- `id`: UUID
- `pid`: 匿名身份
- `orderId`: 订单号
- `seasonId`: 季度 ID
- `fromCandidateId`: 原候选人
- `toCandidateId`: 新候选人
- `changedAt`: 修改时间

## 开发进度

- [x] Phase 1: 项目初始化与数据库设计 ✅
- [x] Phase 2: 核心 API 开发 ✅
  - POST /api/one-pick/submit (提交投票)
  - POST /api/one-pick/change (修改投票)
  - GET /api/one-pick/verify (查询投票)
  - GET /api/one-pick/leaderboard (榜单数据)
  - GET /api/one-pick/seasons (季度列表)
- [x] Phase 3: 前端页面开发 ✅
  - Landing Page (投票提交页面)
  - Verify Page (查询投票页面)
  - Change Page (修改投票页面)
  - Leaderboard Page (榜单页面)
  - Editorial Magazine 设计风格
- [ ] Phase 4: Dashboard 可视化
- [ ] Phase 5: 部署与测试
- [ ] Phase 6: 优化与加固

## API 测试

查看 [API_TESTING.md](./API_TESTING.md) 了解如何测试 API。

## License

MIT
