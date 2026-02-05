/**
 * 日期验证工具函数
 * 处理订单号中的日期验证，考虑时区差异
 */

/**
 * 解析订单号中的日期（YYMMDD）
 * @param yymmdd - 6位日期字符串，例如 "260205"
 * @returns Date对象（UTC时间）或 null（如果格式无效）
 */
export function parseDateFromYYMMDD(yymmdd: string): Date | null {
  if (!/^\d{6}$/.test(yymmdd)) {
    return null;
  }
  
  const yy = parseInt(yymmdd.slice(0, 2));
  const mm = parseInt(yymmdd.slice(2, 4));
  const dd = parseInt(yymmdd.slice(4, 6));
  
  // 基础格式验证
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }
  
  const year = 2000 + yy;
  
  // 验证月份天数是否合理
  const daysInMonth = new Date(year, mm, 0).getDate();
  if (dd > daysInMonth) {
    return null;
  }
  
  // 返回 UTC 时间（午夜 00:00）
  return new Date(Date.UTC(year, mm - 1, dd, 0, 0, 0));
}

/**
 * 验证订单日期范围
 * 允许范围：今天往前一年，到明天（考虑时区差异）
 * @param yymmdd - 6位日期字符串
 * @returns 验证结果
 */
export function validateOrderDateRange(yymmdd: string): {
  valid: boolean;
  error?: string;
  date?: Date;
} {
  const orderDate = parseDateFromYYMMDD(yymmdd);
  
  if (!orderDate) {
    return { valid: false, error: '日期格式无效' };
  }
  
  // 获取今天 00:00 UTC
  const nowUTC = new Date();
  const todayUTC = new Date(Date.UTC(
    nowUTC.getUTCFullYear(),
    nowUTC.getUTCMonth(),
    nowUTC.getUTCDate(),
    0, 0, 0, 0
  ));
  
  // 明天 00:00 UTC（允许时区差异，容差 +1 天）
  const tomorrowUTC = new Date(todayUTC);
  tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
  
  // 一年前 00:00 UTC
  const oneYearAgoUTC = new Date(todayUTC);
  oneYearAgoUTC.setUTCFullYear(oneYearAgoUTC.getUTCFullYear() - 1);
  
  // 验证：不能晚于明天
  if (orderDate.getTime() > tomorrowUTC.getTime()) {
    return {
      valid: false,
      error: '订单日期无效（未来日期）'
    };
  }
  
  // 验证：不能早于一年前
  if (orderDate.getTime() < oneYearAgoUTC.getTime()) {
    return {
      valid: false,
      error: '订单日期过早（超过一年）'
    };
  }
  
  return {
    valid: true,
    date: orderDate
  };
}

/**
 * 获取当前日期信息（UTC）
 * 用于调试和日志
 */
export function getCurrentDateInfo() {
  const now = new Date();
  
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  
  return {
    utc: {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
      yymmdd: `${yy}${mm}${dd}`
    },
    iso: now.toISOString(),
    timestamp: now.getTime()
  };
}

/**
 * 格式化日期范围（用于错误提示）
 */
export function formatDateRange(): string {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  
  const tomorrowUTC = new Date(todayUTC);
  tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
  
  const oneYearAgoUTC = new Date(todayUTC);
  oneYearAgoUTC.setUTCFullYear(oneYearAgoUTC.getUTCFullYear() - 1);
  
  const formatDate = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return `${year}年${month}月${day}日`;
  };
  
  return `${formatDate(oneYearAgoUTC)} 至 ${formatDate(tomorrowUTC)}`;
}
