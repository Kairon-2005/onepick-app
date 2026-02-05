# 🐛 Bug 修复：重复 pid 插入错误

## 问题描述

### 错误信息
```
ERROR code: '23505'
detail: 'Key (pid)=(ca813393-4ab5-40f7-aa58-0fa32775e816) already exists.'
constraint: 'order_bindings_pid_key'
```

### 问题原因

数据库约束：
- `order_bindings` 表中 `pid` 字段有 `UNIQUE` 约束
- 一个 pid 只能绑定一个 order_id

原代码逻辑问题：
```javascript
// ❌ 错误的逻辑顺序
1. 检查 order_id 是否已被使用
2. 如果没有，尝试插入 (pid, order_id)
3. 💥 如果这个 pid 之前用过不同的 order_id，就会报错
```

### 触发场景

用户 A（pid: xxx）：
1. 第一次用订单号 `TF260101041111111` 投票 ✅
2. 第二次用订单号 `TF260202042222222` 投票 ❌ （崩溃）

---

## 解决方案

### 修复后的逻辑

```javascript
// ✅ 正确的逻辑顺序
1. 先检查这个 pid 是否已经绑定过订单号
2. 如果已绑定：
   a. 检查提交的订单号是否与已绑定的匹配
   b. 如果匹配，检查本季度是否已投票
   c. 如果不匹配，拒绝（提示用旧订单号）
3. 如果未绑定（新用户）：
   a. 检查这个订单号是否被其他人使用
   b. 如果未使用，创建绑定
```

### 核心改动

**之前**：先查订单号 → 再插入 pid 绑定  
**现在**：先查 pid → 再查订单号 → 最后插入

---

## 业务规则说明

### R1: 一个 pid 只能绑定一个 order_id（永久）

```javascript
// 用户第一次投票
pid: "aaa" + order_id: "TF260101041111111" ✅
// 绑定成功

// 同一用户尝试换订单号
pid: "aaa" + order_id: "TF260202042222222" ❌
// 错误：请使用您之前绑定的订单号
```

### R2: 一个 order_id 只能被一个 pid 使用

```javascript
// 用户A投票
pid: "aaa" + order_id: "TF260101041111111" ✅

// 用户B尝试用同一订单号
pid: "bbb" + order_id: "TF260101041111111" ❌
// 错误：该订单号已被使用
```

### R3: 每季度可以投一次票

```javascript
// 2026 Q1
pid: "aaa" + order_id: "TF260101041111111" + candidate: "lisa" ✅

// 2026 Q2（新季度）
pid: "aaa" + order_id: "TF260101041111111" + candidate: "jennie" ✅
// 可以投票（新季度）

// 2026 Q1（同季度）
pid: "aaa" + order_id: "TF260101041111111" + candidate: "jisoo" ❌
// 错误：您已在本季度投过票了
```

---

## 代码对比

### 修复前

```typescript
// ❌ 容易出错的代码
// 5. 检查订单号是否已被绑定
const existingBinding = await db
  .select()
  .from(orderBindings)
  .where(eq(orderBindings.orderId, orderId))
  .limit(1);

if (existingBinding.length > 0) {
  if (existingBinding[0].pid !== pid) {
    return error('该订单号已被使用');
  }
  // 检查是否已投票...
} else {
  // 6. 创建新的订单绑定
  await db.insert(orderBindings).values({ pid, orderId });
  // 💥 如果 pid 已存在但 orderId 不同，这里会崩溃
}
```

### 修复后

```typescript
// ✅ 正确的代码
// 5. 首先检查：这个 pid 是否已经绑定了订单号
const existingPidBinding = await db
  .select()
  .from(orderBindings)
  .where(eq(orderBindings.pid, pid))
  .limit(1);

if (existingPidBinding.length > 0) {
  // 该用户已经绑定过订单号
  const boundOrderId = existingPidBinding[0].orderId;
  
  // 检查提交的订单号是否匹配
  if (boundOrderId !== orderId) {
    return error('请使用您之前绑定的订单号');
  }
  
  // 检查本季度是否已投票...
} else {
  // 6. 这是新用户，检查订单号是否已被其他人使用
  const existingOrderBinding = await db
    .select()
    .from(orderBindings)
    .where(eq(orderBindings.orderId, orderId))
    .limit(1);

  if (existingOrderBinding.length > 0) {
    return error('该订单号已被使用');
  }

  // 7. 创建新的订单绑定
  await db.insert(orderBindings).values({ pid, orderId });
}
```

---

## 错误消息

新增了更清晰的错误提示：

| 错误代码 | 消息 | 场景 |
|---------|------|------|
| `ORDER_ID_MISMATCH` | "请使用您之前绑定的订单号" | 用户尝试换订单号 |
| `ORDER_ID_ALREADY_BOUND` | "该订单号已被使用" | 订单号被其他人用了 |
| `VOTE_ALREADY_EXISTS` | "您已在本季度投过票了" | 同季度重复投票 |

---

## 测试用例

### 场景1：新用户首次投票 ✅

```bash
curl -X POST /api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041478489",
    "candidateId": "lisa"
  }'

# 预期：成功
# pid: xxx 绑定 order_id: TF260205041478489
```

### 场景2：同一用户在新季度投票 ✅

```bash
# Q1 投票成功后，Q2 再次投票
curl -X POST /api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041478489",
    "candidateId": "jennie"
  }'

# 预期：成功
# 同一 pid，同一 order_id，但不同季度
```

### 场景3：同一用户尝试换订单号 ❌

```bash
# 已用 TF260205041478489 投过票后
curl -X POST /api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260206042345678",
    "candidateId": "jisoo"
  }'

# 预期：失败
# {
#   "success": false,
#   "error": {
#     "code": "ORDER_ID_MISMATCH",
#     "message": "请使用您之前绑定的订单号"
#   }
# }
```

### 场景4：不同用户使用相同订单号 ❌

```bash
# 用户A已用这个订单号后，用户B尝试使用
# (清除 cookie 模拟不同用户)
curl -X POST /api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041478489",
    "candidateId": "rose"
  }'

# 预期：失败
# {
#   "success": false,
#   "error": {
#     "code": "ORDER_ID_ALREADY_BOUND",
#     "message": "该订单号已被使用"
#   }
# }
```

### 场景5：同一季度重复投票 ❌

```bash
# Q1 投过票后，Q1 再次投票
curl -X POST /api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041478489",
    "candidateId": "jisoo"
  }'

# 预期：失败
# {
#   "success": false,
#   "error": {
#     "code": "VOTE_ALREADY_EXISTS",
#     "message": "您已在本季度投过票了"
#   }
# }
```

---

## 数据库约束

```sql
-- order_bindings 表约束
CREATE TABLE order_bindings (
  pid UUID NOT NULL UNIQUE,        -- 一个pid只能出现一次
  order_id TEXT NOT NULL UNIQUE,   -- 一个order_id只能出现一次
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (pid, order_id)      -- 复合主键
);

-- one_pick_votes 表约束
CREATE TABLE one_pick_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES one_pick_seasons(id),
  order_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (season_id, order_id)     -- 每季度+订单号组合唯一
);
```

---

## 修改的文件

```
app/api/one-pick/submit/route.ts  ← 修复投票逻辑
lib/api/types.ts                  ← 添加 ORDER_ID_MISMATCH 错误码
BUG_FIX_DUPLICATE_PID.md          ← 本文档
```

---

## 部署步骤

1. **备份当前数据**（如果生产环境已有数据）
   ```bash
   # 在 Neon 中导出数据
   ```

2. **更新代码**
   ```bash
   git pull
   npm install
   ```

3. **本地测试**
   ```bash
   npm run dev
   # 按上述测试用例测试各场景
   ```

4. **部署到生产**
   ```bash
   vercel --prod
   ```

---

## 注意事项

### ⚠️ 如果用户抱怨无法投票

**症状**：用户说"我明明没投过票，为什么说我投过了？"

**可能原因**：
1. 用户清除了浏览器数据（cookie 丢失）
2. 用户换了设备
3. 用户换了浏览器

**解决方案**：
- 告知用户：订单号永久绑定，只能用同一订单号
- 如果确认是误操作，可以手动解绑（需要数据库操作）

### ⚠️ 手动解绑（管理员操作）

如果需要解绑某个用户的订单号：

```sql
-- 1. 查找绑定
SELECT * FROM order_bindings WHERE order_id = 'TF260205041478489';

-- 2. 删除绑定（谨慎！）
DELETE FROM order_bindings WHERE order_id = 'TF260205041478489';

-- 3. 删除相关投票记录（如果需要）
DELETE FROM one_pick_votes WHERE order_id = 'TF260205041478489';
```

---

## ✅ 完成检查

- [x] 修复 pid 重复插入错误
- [x] 优化检查顺序
- [x] 添加清晰的错误消息
- [x] 创建测试用例
- [x] 更新文档

---

**修复完成！现在用户无法使用多个订单号，系统逻辑更加健壮。** 🎉
