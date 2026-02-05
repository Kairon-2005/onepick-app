import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderBindings, onePickVotes, onePickSeasons, changeKeys, onePickChangeLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateOrderId, normalizeOrderId } from '@/lib/utils/order';
import { isValidCandidateId } from '@/lib/config/candidates';
import { generateChangeKey, hashChangeKey, verifyChangeKey } from '@/lib/utils/crypto';
import { getPidFromCookies } from '@/lib/api/pid';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/types';

/**
 * POST /api/one-pick/change
 * 修改投票
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId: rawOrderId, candidateId, changeKey } = body;

    // 1. 校验订单号格式
    const orderId = normalizeOrderId(rawOrderId);
    if (!validateOrderId(orderId)) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_ORDER_ID, '订单号格式不正确'),
        { status: 400 }
      );
    }

    // 2. 校验候选人 ID
    if (!isValidCandidateId(candidateId)) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_CANDIDATE_ID, '无效的候选人'),
        { status: 400 }
      );
    }

    // 3. 校验修改密钥
    if (!changeKey || typeof changeKey !== 'string') {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_CHANGE_KEY, '请提供修改密钥'),
        { status: 400 }
      );
    }

    // 4. 获取 PID
    const pid = await getPidFromCookies();
    if (!pid) {
      return NextResponse.json(
        errorResponse(ErrorCodes.PID_REQUIRED, '未找到用户身份'),
        { status: 401 }
      );
    }

    // 5. 获取当前活跃季度
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

    // 6. 验证订单号绑定
    const [binding] = await db
      .select()
      .from(orderBindings)
      .where(eq(orderBindings.orderId, orderId))
      .limit(1);

    if (!binding) {
      return NextResponse.json(
        errorResponse(ErrorCodes.ORDER_ID_NOT_FOUND, '订单号未绑定'),
        { status: 404 }
      );
    }

    if (binding.pid !== pid) {
      return NextResponse.json(
        errorResponse(ErrorCodes.PID_ORDER_MISMATCH, '订单号与当前用户不匹配'),
        { status: 403 }
      );
    }

    // 7. 获取当前投票
    const [currentVote] = await db
      .select()
      .from(onePickVotes)
      .where(
        and(
          eq(onePickVotes.orderId, orderId),
          eq(onePickVotes.seasonId, activeSeason.id)
        )
      )
      .limit(1);

    if (!currentVote) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VOTE_NOT_FOUND, '本季度未投票'),
        { status: 404 }
      );
    }

    // 8. 检查是否已修改过（查询修改日志）
    const changeLogs = await db
      .select()
      .from(onePickChangeLogs)
      .where(
        and(
          eq(onePickChangeLogs.orderId, orderId),
          eq(onePickChangeLogs.seasonId, activeSeason.id)
        )
      );

    if (changeLogs.length >= 1) {
      return NextResponse.json(
        errorResponse(ErrorCodes.CHANGE_LIMIT_REACHED, '本季度已达到修改次数上限'),
        { status: 400 }
      );
    }

    // 9. 验证修改密钥
    const [storedKey] = await db
      .select()
      .from(changeKeys)
      .where(
        and(
          eq(changeKeys.orderId, orderId),
          eq(changeKeys.seasonId, activeSeason.id)
        )
      )
      .limit(1);

    if (!storedKey) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_CHANGE_KEY, '未找到修改密钥'),
        { status: 404 }
      );
    }

    const isValidKey = await verifyChangeKey(changeKey, storedKey.keyHash);
    if (!isValidKey) {
      return NextResponse.json(
        errorResponse(ErrorCodes.INVALID_CHANGE_KEY, '修改密钥不正确'),
        { status: 401 }
      );
    }

    // 10. 更新投票
    const fromCandidateId = currentVote.candidateId;
    
    await db
      .update(onePickVotes)
      .set({
        candidateId,
        updatedAt: new Date(),
      })
      .where(eq(onePickVotes.id, currentVote.id));

    // 11. 记录修改日志
    await db.insert(onePickChangeLogs).values({
      pid,
      orderId,
      seasonId: activeSeason.id,
      fromCandidateId,
      toCandidateId: candidateId,
    });

    // 12. 生成新的修改密钥（轮换）
    const newChangeKey = generateChangeKey();
    const newKeyHash = await hashChangeKey(newChangeKey);

    // 删除旧密钥，插入新密钥
    await db
      .delete(changeKeys)
      .where(
        and(
          eq(changeKeys.orderId, orderId),
          eq(changeKeys.seasonId, activeSeason.id)
        )
      );

    await db.insert(changeKeys).values({
      orderId,
      seasonId: activeSeason.id,
      keyHash: newKeyHash,
    });

    // 13. 返回成功响应（但用户已用完修改次数，新密钥无用）
    return NextResponse.json(
      successResponse({
        orderId,
        season: activeSeason.name,
        changeKey: newChangeKey,
        changesRemaining: 0, // 已用完
      })
    );
  } catch (error) {
    console.error('Change vote error:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '服务器错误'),
      { status: 500 }
    );
  }
}
