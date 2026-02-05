import { validateOrderDateRange } from './date';

/**
 * 订单号验证结果
 */
export interface OrderIdValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parts?: {
    prefix: string;    // "TF"
    yy: string;        // "26"
    mm: string;        // "02"
    dd: string;        // "04"
    fixed: string;     // "04" (固定位)
    sequence: string;  // "1478489" (7位序列号)
  };
}

/**
 * 黑名单订单号（明显的测试号）
 */
const BLACKLIST_SEQUENCES = [
  '0000000',
  '1111111',
  '2222222',
  '3333333',
  '4444444',
  '5555555',
  '6666666',
  '7777777',
  '8888888',
  '9999999',
  '1234567',
  '7654321',
  '0123456',
  '9876543',
];

/**
 * 标准化订单号（去除空格、转大写）
 */
export function normalizeOrderId(orderId: string): string {
  return orderId.trim().toUpperCase();
}

/**
 * 基础格式验证
 * 格式：TF + YYMMDD + 04 + 7位数字
 * 示例：TF260204041478489
 */
function validateBasicFormat(orderId: string): {
  valid: boolean;
  error?: string;
  parts?: OrderIdValidationResult['parts'];
} {
  // 1. 长度检查：必须是17位
  if (orderId.length !== 17) {
    return { valid: false, error: '订单号长度错误' };
  }
  
  // 2. 前缀检查：必须是 TF
  if (!orderId.startsWith('TF')) {
    return { valid: false, error: '订单号必须以 TF 开头' };
  }
  
  // 3. 格式检查：TF + 15位数字
  if (!/^TF\d{15}$/.test(orderId)) {
    return { valid: false, error: '订单号格式错误' };
  }
  
  // 4. 提取各部分
  const parts = {
    prefix: orderId.slice(0, 2),   // "TF"
    yy: orderId.slice(2, 4),        // "26"
    mm: orderId.slice(4, 6),        // "02"
    dd: orderId.slice(6, 8),        // "04"
    fixed: orderId.slice(8, 10),    // "04" (关键！)
    sequence: orderId.slice(10),    // "1478489"
  };
  
  // 5. 关键验证：第8-9位必须是 "04"
  if (parts.fixed !== '04') {
    return { valid: false, error: '订单号格式错误' };
  }
  
  return { valid: true, parts };
}

/**
 * 序列号合理性验证
 */
function validateSequenceNumber(sequence: string): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  const seqNum = parseInt(sequence);
  
  // 1. 范围检查：7位数字应该在 1000000-9999999
  if (seqNum < 1000000 || seqNum > 9999999) {
    return { valid: false, error: '订单号格式异常' };
  }
  
  // 2. 黑名单检查
  if (BLACKLIST_SEQUENCES.includes(sequence)) {
    return { valid: false, error: '订单号无效' };
  }
  
  // 3. 可疑模式检测（仅警告）
  const uniqueDigits = new Set(sequence.split(''));
  if (uniqueDigits.size <= 2) {
    return {
      valid: true,
      warning: '订单号格式可疑（数字多样性不足）'
    };
  }
  
  // 4. 递增/递减序列检测
  let isIncreasing = true;
  let isDecreasing = true;
  for (let i = 1; i < sequence.length; i++) {
    if (parseInt(sequence[i]) !== parseInt(sequence[i-1]) + 1) {
      isIncreasing = false;
    }
    if (parseInt(sequence[i]) !== parseInt(sequence[i-1]) - 1) {
      isDecreasing = false;
    }
  }
  
  if (isIncreasing || isDecreasing) {
    return {
      valid: true,
      warning: '订单号格式可疑（数字呈规律排列）'
    };
  }
  
  return { valid: true };
}

/**
 * 完整的订单号验证
 * @param orderId - 订单号字符串
 * @returns 详细的验证结果
 */
export function validateOrderId(orderId: string): OrderIdValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. 基础格式验证
  const formatCheck = validateBasicFormat(orderId);
  if (!formatCheck.valid) {
    return {
      valid: false,
      errors: [formatCheck.error!],
      warnings: []
    };
  }
  
  const parts = formatCheck.parts!;
  const yymmdd = `${parts.yy}${parts.mm}${parts.dd}`;
  
  // 2. 日期范围验证
  const dateCheck = validateOrderDateRange(yymmdd);
  if (!dateCheck.valid) {
    errors.push(dateCheck.error!);
  }
  
  // 3. 序列号合理性验证
  const seqCheck = validateSequenceNumber(parts.sequence);
  if (!seqCheck.valid) {
    errors.push(seqCheck.error!);
  }
  if (seqCheck.warning) {
    warnings.push(seqCheck.warning);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parts
  };
}

/**
 * 简化的布尔验证（向后兼容）
 */
export function isValidOrderId(orderId: string): boolean {
  const result = validateOrderId(orderId);
  return result.valid;
}
