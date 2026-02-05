# 订单号验证测试用例

本文件用于测试订单号验证逻辑的正确性。

## 测试环境设置

```bash
# 在项目根目录下运行
npm install
npm run dev
```

## 手动测试用例

### ✅ 有效订单号

假设今天是 2026-02-05：

```javascript
// 1. 标准格式
TF260205041478489  // 今天
TF260204041234567  // 昨天
TF260206041234567  // 明天（允许时区差异）
TF260101042345678  // 2个月前
TF251205043456789  // 3个月前

// 2. 边界情况
TF250205045678901  // 正好一年前的今天
TF260206049999999  // 明天 + 最大序列号
```

### ❌ 无效订单号 - 格式错误

```javascript
// 长度错误
TF26020404147848    // 太短
TF2602040414784891  // 太长

// 前缀错误
TG260205041478489   // 错误前缀
tf260205041478489   // 小写（会被标准化）
260205041478489     // 缺少前缀

// 固定位错误（关键！）
TF260205001478489   // "04" 位置是 "00"
TF260205111478489   // "04" 位置是 "11"
TF260205991478489   // "04" 位置是 "99"
```

### ❌ 无效订单号 - 日期错误

```javascript
// 未来日期（超过容差）
TF260207041478489   // 后天（超过+1天容差）
TF260301041478489   // 下个月
TF270205041478489   // 明年

// 过期日期
TF250204041478489   // 超过一年
TF240205041478489   // 2年前
TF200101041478489   // 26年前

// 不存在的日期
TF260230041478489   // 2月30日
TF260229041478489   // 2月29日（2026非闰年）
TF260431041478489   // 4月31日
TF260001041478489   // 0月
TF260013041478489   // 13月
```

### ❌ 无效订单号 - 黑名单

```javascript
TF260205041111111   // 全相同
TF260205042222222   // 全相同
TF260205041234567   // 递增序列
TF260205047654321   // 递减序列
TF260205040000000   // 全0
TF260205049999999   // 全9（注意：这个不在黑名单，是有效的）
```

### ⚠️ 可疑订单号（有警告但不拒绝）

```javascript
TF260205041111122   // 数字多样性不足（只有1和2）
TF260205041212121   // 重复模式
```

## API 测试

### 测试提交投票

```bash
# 有效订单号
curl -X POST http://localhost:3000/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041478489",
    "candidateId": "lisa"
  }'

# 预期响应：
# {
#   "success": true,
#   "data": {
#     "orderId": "TF260205041478489",
#     "season": "2026 Q1",
#     "changeKey": "XXXX-XXXX-XXXX"
#   }
# }
```

```bash
# 无效订单号 - 格式错误
curl -X POST http://localhost:3000/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205001478489",
    "candidateId": "lisa"
  }'

# 预期响应：
# {
#   "success": false,
#   "error": {
#     "code": "INVALID_ORDER_ID",
#     "message": "订单号格式错误"
#   }
# }
```

```bash
# 无效订单号 - 日期错误
curl -X POST http://localhost:3000/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF270205041478489",
    "candidateId": "lisa"
  }'

# 预期响应：
# {
#   "success": false,
#   "error": {
#     "code": "INVALID_ORDER_ID",
#     "message": "订单日期无效（未来日期）"
#   }
# }
```

```bash
# 无效订单号 - 黑名单
curl -X POST http://localhost:3000/api/one-pick/submit \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TF260205041111111",
    "candidateId": "lisa"
  }'

# 预期响应：
# {
#   "success": false,
#   "error": {
#     "code": "INVALID_ORDER_ID",
#     "message": "订单号无效"
#   }
# }
```

## 单元测试（可选）

如果要添加自动化测试，可以创建以下测试文件：

```typescript
// lib/utils/__tests__/order.test.ts

import { validateOrderId } from '../order';

describe('订单号验证', () => {
  describe('格式验证', () => {
    it('应该接受有效的订单号', () => {
      const result = validateOrderId('TF260205041478489');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝错误的固定位', () => {
      const result = validateOrderId('TF260205001478489');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('订单号格式错误');
    });
  });

  describe('日期验证', () => {
    it('应该拒绝未来日期', () => {
      const result = validateOrderId('TF270205041478489');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('未来日期'))).toBe(true);
    });

    it('应该拒绝过期日期', () => {
      const result = validateOrderId('TF240205041478489');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('超过一年'))).toBe(true);
    });
  });

  describe('黑名单验证', () => {
    it('应该拒绝黑名单号码', () => {
      const result = validateOrderId('TF260205041111111');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('订单号无效');
    });
  });
});
```

## 验证清单

在部署前，请确认以下测试通过：

- [ ] 标准格式订单号可以提交
- [ ] 固定位错误的订单号被拒绝
- [ ] 未来日期（超过明天）被拒绝
- [ ] 过期日期（超过一年）被拒绝
- [ ] 黑名单号码被拒绝
- [ ] 不存在的日期被拒绝（如2月30日）
- [ ] 已使用的订单号被拒绝
- [ ] 可疑模式记录警告但不拒绝

## 测试注意事项

1. **时区问题**：测试时注意服务器和本地时间可能不同
2. **日期边界**：特别测试今天、明天、一年前的边界情况
3. **标准化**：小写输入会被自动转为大写
4. **空格处理**：前后空格会被自动去除

## 调试技巧

如果遇到问题，可以查看服务器日志：

```bash
# 查看详细验证信息
tail -f .next/server.log

# 或者在代码中添加日志
console.log('Validation result:', validateOrderId('TF260205041478489'));
```
