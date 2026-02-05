import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onePickVotes, onePickSeasons, onePickChangeLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateOrderId, normalizeOrderId } from '@/lib/utils/order';
import { getCandidateById } from '@/lib/config/candidates';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/types';

/**
 * GET /api/one-pick/verify?orderId=xxx&season=2026Q1
 * 查询投票
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawOrderId = searchParams.get('orderId');
    const seasonName = searchParams.get('season');

    // 1. 校验订单号
    if (!rawOrderId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, '请提供订单号'),
        { status: 400 }
      );
    }

    const orderId = normalizeOrderId(rawOrderId);
    if (!validateOrderId(orderId)) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_ORDER_ID, '订单号格式不正确'),
        { status: 400 }
      );
    }

    // 2. 获取季度
    let season;
    if (seasonName) {
      // 查询指定季度
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

    // 3. 查询投票记录
    const [vote] = await db
      .select()
      .from(onePickVotes)
      .where(
        and(
          eq(onePickVotes.orderId, orderId),
          eq(onePickVotes.seasonId, season.id)
        )
      )
      .limit(1);

    if (!vote) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VOTE_NOT_FOUND, '本季度未投票'),
        { status: 404 }
      );
    }

    // 4. 查询修改记录
    const changeLogs = await db
      .select()
      .from(onePickChangeLogs)
      .where(
        and(
          eq(onePickChangeLogs.orderId, orderId),
          eq(onePickChangeLogs.seasonId, season.id)
        )
      );

    const hasChanged = changeLogs.length > 0;
    const canChange = changeLogs.length < 1 && season.status === 'active';

    // 5. 获取候选人信息
    const candidate = getCandidateById(vote.candidateId);

    // 6. 返回结果
    return NextResponse.json(
      successResponse({
        orderId,
        season: season.name,
        vote: {
          candidateId: vote.candidateId,
          candidateName: candidate?.name || '未知',
          status: vote.status,
          createdAt: vote.createdAt,
          updatedAt: vote.updatedAt,
        },
        hasChanged,
        canChange,
        changeHistory: changeLogs.map(log => ({
          from: getCandidateById(log.fromCandidateId)?.name || '未知',
          to: getCandidateById(log.toCandidateId)?.name || '未知',
          changedAt: log.changedAt,
        })),
      })
    );
  } catch (error) {
    console.error('Verify vote error:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '服务器错误'),
      { status: 500 }
    );
  }
}
