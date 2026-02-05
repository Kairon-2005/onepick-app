import 'dotenv/config';
import { db } from '../lib/db';
import { onePickSeasons } from '../lib/db/schema';
import { getSeasonDateRange } from '../lib/utils/season';

/**
 * 初始化数据库 - 创建 2026 Q1 季度
 */
async function seed() {
  console.log('🌱 开始初始化数据库...');

  try {
    // 创建 2026 Q1
    const { startAt, endAt } = getSeasonDateRange(2026, 1);
    
    const [season] = await db.insert(onePickSeasons).values({
      name: '2026 Q1',
      startAt,
      endAt,
      status: 'active', // 直接设为 active 方便测试
    }).returning();

    console.log('✅ 创建季度成功:', season);

    // 可选：创建更多季度
    const q2 = getSeasonDateRange(2026, 2);
    await db.insert(onePickSeasons).values({
      name: '2026 Q2',
      startAt: q2.startAt,
      endAt: q2.endAt,
      status: 'upcoming',
    });

    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

seed();
