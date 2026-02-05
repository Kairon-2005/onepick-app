/**
 * 获取当前季度名称
 * 例如：2026 Q1
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-11 -> 1-12
  const quarter = Math.ceil(month / 3);
  return `${year} Q${quarter}`;
}

/**
 * 获取季度的起止时间
 */
export function getSeasonDateRange(year: number, quarter: number): {
  startAt: Date;
  endAt: Date;
} {
  const startMonth = (quarter - 1) * 3;
  const startAt = new Date(year, startMonth, 1, 0, 0, 0);
  const endAt = new Date(year, startMonth + 3, 0, 23, 59, 59);
  
  return { startAt, endAt };
}

/**
 * 解析季度名称
 * "2026 Q1" -> { year: 2026, quarter: 1 }
 */
export function parseSeasonName(seasonName: string): { year: number; quarter: number } | null {
  const match = seasonName.match(/^(\d{4})\s*Q(\d)$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    quarter: parseInt(match[2], 10),
  };
}
