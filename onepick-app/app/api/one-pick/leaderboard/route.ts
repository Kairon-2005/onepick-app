import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onePickVotes, onePickSeasons } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CANDIDATES, getCandidateById } from '@/lib/config/candidates';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/types';

/**
 * GET /api/one-pick/leaderboard?season=2026Q1
 * 获取榜单数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season');

    // 1. 获取季度
    let season;
    if (seasonName) {
      [season] = await db
        .select()
        .from(onePickSeasons)
        .where(eq(onePickSeasons.name, seasonName))
        .limit(1);
    } else {
      // 默认查询当前活跃季度
      [season] = await db
        .select()
        .from(onePickSeasons)
        .where(eq(onePickSeasons.status, 'active'))
        .limit(1);
    }

    if (!season) {
      return NextResponse.json(
        errorResponse(ErrorCodes.SEASON_NOT_FOUND, '未找到指定季度'),
        { status: 404 }
      );
    }

    // 2. 统计各候选人票数（仅统计 status = valid）
    const voteCounts = await db
      .select({
        candidateId: onePickVotes.candidateId,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(onePickVotes)
      .where(
        and(
          eq(onePickVotes.seasonId, season.id),
          eq(onePickVotes.status, 'valid')
        )
      )
      .groupBy(onePickVotes.candidateId);

    // 3. 构建排行榜（包含 0 票的候选人）
    const leaderboard = CANDIDATES.map(candidate => {
      const voteData = voteCounts.find(v => v.candidateId === candidate.id);
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        avatar: candidate.avatar,
        voteCount: voteData?.count || 0,
      };
    });

    // 4. 按票数排序
    leaderboard.sort((a, b) => b.voteCount - a.voteCount);

    // 5. 添加排名
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    // 6. 获取总票数
    const totalVotes = leaderboard.reduce((sum, item) => sum + item.voteCount, 0);

    return NextResponse.json(
      successResponse({
        season: season.name,
        seasonStatus: season.status,
        totalVotes,
        leaderboard: rankedLeaderboard,
      })
    );
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '服务器错误'),
      { status: 500 }
    );
  }
}
