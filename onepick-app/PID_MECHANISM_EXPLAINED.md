# 🔐 PID（匿名身份）机制详解

## 📋 什么是 PID？

**PID** = **P**ersonal **ID**entifier（个人标识符）

这是一个 **UUID v4** 格式的随机字符串，用于：
- 唯一标识一个用户
- 不需要登录/注册
- 完全匿名
- 本地存储

**示例**：
```
ca813393-4ab5-40f7-aa58-0fa32775e816
```

---

## 🔄 PID 生成流程

### 第一次访问网站时

```mermaid
用户访问 → 检查 Cookie → 没有 PID 
           ↓
        生成新 UUID
           ↓
    存储到 Cookie (服务端)
           ↓
    返回 PID 给前端
```

**代码实现**：

```typescript
// lib/utils/pid.ts
import { v4 as uuidv4 } from 'uuid';

export function generatePid(): string {
  return uuidv4(); // 生成随机 UUID
  // 例如: "ca813393-4ab5-40f7-aa58-0fa32775e816"
}
```

```typescript
// lib/api/pid.ts
export async function getOrCreatePid(): Promise<string> {
  const cookieStore = await cookies();
  let pid = cookieStore.get('onepick_pid')?.value;
  
  if (!pid) {
    // 第一次访问，生成新 PID
    pid = generatePid();
    
    // 存储到 Cookie
    cookieStore.set('onepick_pid', pid, {
      httpOnly: true,           // JS 无法访问（安全）
      secure: true,             // 仅 HTTPS
      sameSite: 'lax',          // CSRF 防护
      maxAge: 60 * 60 * 24 * 365 * 10  // 10 年有效期
    });
  }
  
  return pid;
}
```

---

## 💾 PID 存储位置

### 1. Cookie（服务端设置）

**位置**：浏览器 Cookie  
**名称**：`onepick_pid`  
**类型**：HttpOnly Cookie  
**有效期**：10 年

**特点**：
- ✅ 服务端设置，更安全
- ✅ HttpOnly，JS 无法读取/修改
- ✅ 每次请求自动携带
- ✅ 持久化存储
- ❌ 用户清除 Cookie 会丢失

**查看方式**：
```
Chrome DevTools → Application → Cookies → 你的域名
找到：onepick_pid
```

### 2. LocalStorage（前端备用，可选）

**位置**：浏览器 LocalStorage  
**名称**：`onepick_pid`  
**用途**：前端缓存（当前代码未启用）

**如果启用，代码示例**：
```typescript
// 前端存储（可选）
if (typeof window !== 'undefined') {
  localStorage.setItem('onepick_pid', pid);
}

// 前端读取（可选）
const pid = localStorage.getItem('onepick_pid');
```

---

## 🔐 PID 安全特性

### 1. HttpOnly Cookie

```typescript
httpOnly: true  // JavaScript 无法访问
```

**防护**：XSS 攻击无法窃取 PID

### 2. Secure Flag

```typescript
secure: process.env.NODE_ENV === 'production'  // 仅 HTTPS
```

**防护**：中间人攻击无法窃取 PID

### 3. SameSite

```typescript
sameSite: 'lax'  // 跨站请求限制
```

**防护**：CSRF 攻击

### 4. UUID v4

```typescript
v4 as uuidv4  // 随机生成，无法预测
```

**防护**：暴力破解（概率极低）

---

## 🎯 PID 的作用

### 1. 用户身份识别

```typescript
// API 调用时
const pid = await getOrCreatePid();
// pid: "ca813393-4ab5-40f7-aa58-0fa32775e816"

// 数据库查询
SELECT * FROM order_bindings WHERE pid = 'ca813393-...';
```

### 2. 防止重复投票

```typescript
// 检查这个 pid 是否已投票
const existingBinding = await db
  .select()
  .from(orderBindings)
  .where(eq(orderBindings.pid, pid));

if (existingBinding.length > 0) {
  return error('您已经投过票了');
}
```

### 3. 绑定订单号

```typescript
// pid ↔ order_id 永久绑定
await db.insert(orderBindings).values({
  pid: "ca813393-4ab5-40f7-aa58-0fa32775e816",
  orderId: "TF260205041478489"
});
```

---

## 🔄 PID 生命周期

### 正常流程

```
第1次访问 → 生成 PID → 存 Cookie → 投票 → 绑定订单号
    ↓
第2次访问 → 读 Cookie → 获取 PID → 检查是否已投票
    ↓
第N次访问 → 读 Cookie → 获取 PID → （持续10年）
```

### 异常情况

#### 情况1：用户清除 Cookie

```
清除 Cookie → PID 丢失 → 下次访问生成新 PID
    ↓
新 PID ≠ 旧 PID
    ↓
无法识别为同一用户
    ↓
可以再次投票（但需要新订单号）
```

#### 情况2：换设备/浏览器

```
新设备 → 没有 Cookie → 生成新 PID
    ↓
新 PID ≠ 旧 PID
    ↓
可以再次投票（但需要新订单号）
```

#### 情况3：隐私模式

```
隐私模式 → Cookie 不持久 → 关闭浏览器后丢失
    ↓
重新打开 → 生成新 PID
```

---

## 📊 数据库关系

### order_bindings 表

```sql
CREATE TABLE order_bindings (
  pid UUID NOT NULL UNIQUE,        -- PID（用户标识）
  order_id TEXT NOT NULL UNIQUE,   -- 订单号
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (pid, order_id)
);
```

**约束**：
- 一个 PID 只能绑定一个订单号
- 一个订单号只能绑定一个 PID

**示例数据**：
```
pid                                   | order_id          | created_at
--------------------------------------|-------------------|-------------------
ca813393-4ab5-40f7-aa58-0fa32775e816 | TF260205041478489 | 2026-02-05 10:00
d1234567-89ab-cdef-0123-456789abcdef | TF260206042345678 | 2026-02-06 11:00
```

---

## 🤔 常见问题

### Q1: PID 可以找回吗？

**A**: 不可以。如果 Cookie 丢失，PID 就永久丢失了。

**解决方案**：
- 告知用户不要清除浏览器数据
- 使用同一设备和浏览器
- （未来可选）添加邮箱绑定找回功能

### Q2: 用户换设备怎么办？

**A**: 换设备 = 新 PID = 新用户

**当前设计**：不支持跨设备
**原因**：保持简单，无需登录

**如果需要支持跨设备**：
- 方案1：添加邮箱/手机号绑定
- 方案2：提供 PID 导出/导入功能

### Q3: PID 会重复吗？

**A**: 理论上不会，UUID v4 碰撞概率极低

**计算**：
```
UUID v4 空间：2^122 ≈ 5.3 × 10^36
碰撞概率：≈ 1 / 10^18（生成10亿个UUID）
```

### Q4: 用户清除 Cookie 后能再投票吗？

**A**: 可以，但需要新的订单号

**流程**：
```
清除 Cookie → 新 PID → 可以投票
但：旧订单号已被旧 PID 绑定
需要：使用新订单号
```

### Q5: 怎么阻止用户清除 Cookie 后重复投票？

**A**: 当前设计无法完全阻止

**可能的增强方案**：
1. **设备指纹**（侵入性高，可能误判）
2. **IP 限制**（不准确，可能误伤）
3. **订单号验证**（当前方案，最可靠）

**推荐**：依赖订单号验证，一个订单号只能用一次

---

## 🛠️ 调试 PID

### 查看当前 PID

**浏览器控制台**：
```javascript
// 方法1：查看 Cookie（如果不是 HttpOnly）
document.cookie

// 方法2：开发者工具
// Chrome DevTools → Application → Cookies
```

**服务端日志**：
```typescript
// 在 API 中添加日志
const pid = await getOrCreatePid();
console.log('Current PID:', pid);
```

### 清除 PID（测试用）

**浏览器**：
```
Chrome → Settings → Privacy → Clear browsing data
勾选 "Cookies and other site data"
```

**代码**：
```typescript
// 清除 Cookie
cookieStore.delete('onepick_pid');
```

### 手动设置 PID（测试用）

```typescript
// 设置特定的 PID
cookieStore.set('onepick_pid', 'test-pid-12345', {
  httpOnly: true,
  secure: false, // 本地开发
  sameSite: 'lax',
  maxAge: 3600
});
```

---

## 📈 统计分析

### 通过 PID 可以分析

1. **独立用户数**
   ```sql
   SELECT COUNT(DISTINCT pid) FROM order_bindings;
   ```

2. **投票参与率**
   ```sql
   SELECT 
     COUNT(DISTINCT ob.pid) as total_users,
     COUNT(DISTINCT v.order_id) as voted_users
   FROM order_bindings ob
   LEFT JOIN one_pick_votes v ON ob.order_id = v.order_id;
   ```

3. **用户留存**
   ```sql
   -- Q1 投票的用户在 Q2 是否继续投票
   SELECT 
     COUNT(DISTINCT v1.order_id) as q1_users,
     COUNT(DISTINCT v2.order_id) as q2_retained
   FROM one_pick_votes v1
   LEFT JOIN one_pick_votes v2 
     ON v1.order_id = v2.order_id 
     AND v2.season_id = 'q2_id'
   WHERE v1.season_id = 'q1_id';
   ```

---

## 🔒 隐私声明模板

建议在网站添加：

```
我们使用匿名标识符（PID）来识别您的投票，无需注册账号。
PID 存储在您的浏览器中，不包含任何个人信息。
如果清除浏览器数据，您的投票记录将无法恢复。
我们不会收集、存储或分享任何可识别个人身份的信息。
```

---

## 🎯 总结

### PID 设计优势

✅ **简单**：无需登录/注册  
✅ **匿名**：不收集个人信息  
✅ **安全**：HttpOnly + Secure + SameSite  
✅ **持久**：10年有效期  

### PID 设计局限

⚠️ **无法跨设备**：每个设备独立  
⚠️ **无法找回**：Cookie 丢失无法恢复  
⚠️ **可绕过**：清除 Cookie + 新订单号  

### 最佳实践

1. **依赖订单号验证**（主要防护）
2. **PID 作为辅助**（用户体验）
3. **清晰的用户提示**（避免困惑）

---

**PID 就是这样工作的！** 🎉
