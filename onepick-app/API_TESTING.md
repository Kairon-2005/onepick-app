# API 测试指南

## 测试前准备

确保你已经：
1. 运行 `npm run dev` 启动开发服务器
2. 运行 `npx tsx scripts/seed.ts` 初始化数据库（创建 2026 Q1）

---

## 1. 提交投票

```bash
curl -X POST http://localhost:3000/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260204114784891",
    "candidateId": "1"
  }'
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "orderId": "TF260204114784891",
    "season": "2026 Q1",
    "changeKey": "XXXX-XXXX-XXXX"
  }
}
```

**重要：** 保存返回的 `changeKey`，用于后续修改。

---

## 2. 查询投票

```bash
curl "http://localhost:3000/api/one-pick/verify?orderId=TF260204114784891"
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "orderId": "TF260204114784891",
    "season": "2026 Q1",
    "vote": {
      "candidateId": "1",
      "candidateName": "张桂源",
      "status": "valid",
      "createdAt": "2026-02-05T04:00:00.000Z",
      "updatedAt": "2026-02-05T04:00:00.000Z"
    },
    "hasChanged": false,
    "canChange": true,
    "changeHistory": []
  }
}
```

---

## 3. 修改投票

```bash
curl -X POST http://localhost:3000/api/one-pick/change \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260204114784891",
    "candidateId": "2",
    "changeKey": "你的修改密钥"
  }'
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "orderId": "TF260204114784891",
    "season": "2026 Q1",
    "changeKey": "新的密钥",
    "changesRemaining": 0
  }
}
```

**注意：** 本季度只能修改 1 次，修改后 `changesRemaining` 为 0。

---

## 4. 获取榜单

```bash
curl "http://localhost:3000/api/one-pick/leaderboard"
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "season": "2026 Q1",
    "seasonStatus": "active",
    "totalVotes": 1,
    "leaderboard": [
      {
        "rank": 1,
        "candidateId": "1",
        "candidateName": "张桂源",
        "avatar": "/avatars/1.jpg",
        "voteCount": 1
      },
      {
        "rank": 2,
        "candidateId": "2",
        "candidateName": "张函瑞",
        "avatar": "/avatars/2.jpg",
        "voteCount": 0
      },
      // ... 其他候选人
    ]
  }
}
```

---

## 5. 获取季度列表

```bash
curl "http://localhost:3000/api/one-pick/seasons"
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "seasons": [
      {
        "id": "uuid-xxx",
        "name": "2026 Q2",
        "status": "upcoming",
        "startAt": "2026-04-01T00:00:00.000Z",
        "endAt": "2026-06-30T23:59:59.000Z"
      },
      {
        "id": "uuid-xxx",
        "name": "2026 Q1",
        "status": "active",
        "startAt": "2026-01-01T00:00:00.000Z",
        "endAt": "2026-03-31T23:59:59.000Z"
      }
    ]
  }
}
```

---

## 错误响应示例

### 订单号格式错误
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ORDER_ID",
    "message": "订单号格式不正确"
  }
}
```

### 订单号已被使用
```json
{
  "success": false,
  "error": {
    "code": "ORDER_ID_ALREADY_BOUND",
    "message": "该订单号已被使用"
  }
}
```

### 修改密钥错误
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CHANGE_KEY",
    "message": "修改密钥不正确"
  }
}
```

### 达到修改次数上限
```json
{
  "success": false,
  "error": {
    "code": "CHANGE_LIMIT_REACHED",
    "message": "本季度已达到修改次数上限"
  }
}
```

---

## 测试流程建议

1. **提交第一个投票** → 保存返回的密钥
2. **查询投票** → 验证投票成功
3. **修改投票** → 使用密钥修改
4. **再次查询** → 查看 `hasChanged: true`
5. **尝试再次修改** → 应该失败（次数上限）
6. **查看榜单** → 验证排名

---

## 浏览器 Cookie 测试

如果想测试多个用户（不同的 PID）：

1. 使用浏览器隐私模式或不同浏览器
2. 或清除 Cookie：删除 `onepick_pid`
3. 使用不同的订单号进行测试
