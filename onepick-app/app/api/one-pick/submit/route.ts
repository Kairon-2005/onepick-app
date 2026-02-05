import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderBindings, onePickVotes, onePickSeasons, changeKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateOrderId, normalizeOrderId } from '@/lib/utils/order';
import { isValidCandidateId } from '@/lib/config/candidates';
import { generateChangeKey, hashChangeKey } from '@/lib/utils/crypto';
import { getOrCreatePid } from '@/lib/api/pid';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/types';

/**
 * POST /api/one-pick/submit
 * 提交投票
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId: rawOrderId, candidateId } = body;

    // 1. 标准化并验证订单号格式
    const orderId = normalizeOrderId(rawOrderId);
    const validation = validateOrderId(orderId);
    
    if (!validation.valid) {
      // 返回详细的错误信息
      const errorMessage = validation.errors.join('；');
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_ORDER_ID, errorMessage),
        { status: 400 }
      );
    }
    
    // 记录警告信息（如果有）
    if (validation.warnings.length > 0) {
      console.warn('Order ID validation warnings:', {
        orderId,
        warnings: validation.warnings
      });
    }

    // 2. 校验候选人 ID
    if (!isValidCandidateId(candidateId)) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_CANDIDATE_ID, '无效的候选人'),
        { status: 400 }
      );
    }

    // 3. 获取或创建 PID
    const pid = await getOrCreatePid();

    // 4. 获取当前活跃季度
    const [activeSeason] = await db
      .select()
      .from(onePickSeasons)
      .where(eq(onePickSeasons.status, 'active'))
      .limit(1);

    if (!activeSeason) {
      return NextResponse.json(
        errorResponse(ErrorCodes.SEASON_NOT_ACTIVE, '当前没有活跃的投票季度'),
        { status: 400 }
      );
    }

    // 5. 检查订单号是否已被绑定
    const existingBinding = await db
      .select()
      .from(orderBindings)
      .where(eq(orderBindings.orderId, orderId))
      .limit(1);

    if (existingBinding.length > 0) {
      // 订单号已被绑定，检查是否是当前用户
      if (existingBinding[0].pid !== pid) {
        return NextResponse.json(
          errorResponse(ErrorCodes.ORDER_ID_ALREADY_BOUND, '该订单号已被使用'),
          { status: 400 }
        );
      }

      // 是当前用户，检查是否已在本季度投票
      const existingVote = await db
        .select()
        .from(onePickVotes)
        .where(
          and(
            eq(onePickVotes.orderId, orderId),
            eq(onePickVotes.seasonId, activeSeason.id)
          )
        )
        .limit(1);

      if (existingVote.length > 0) {
        return NextResponse.json(
          errorResponse(ErrorCodes.VOTE_ALREADY_EXISTS, '本季度已提交投票'),
          { status: 400 }
        );
      }
    } else {
      // 6. 创建新的订单绑定
      await db.insert(orderBindings).values({
        pid,
        orderId,
      });
    }

    // 7. 创建投票记录
    await db.insert(onePickVotes).values({
      seasonId: activeSeason.id,
      orderId,
      candidateId,
      status: 'valid',
    });

    // 8. 生成修改密钥
    const changeKey = generateChangeKey();
    const keyHash = await hashChangeKey(changeKey);

    await db.insert(changeKeys).values({
      orderId,
      seasonId: activeSeason.id,
      keyHash,
    });

    // 9. 返回成功响应
    return NextResponse.json(
      successResponse({
        orderId,
        season: activeSeason.name,
        changeKey,
      })
    );
  } catch (error) {
    console.error('Submit vote error:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '服务器错误'),
      { status: 500 }
    );
  }
}
