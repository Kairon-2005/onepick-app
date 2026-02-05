import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onePickSeasons } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/types';

/**
 * GET /api/one-pick/seasons
 * 获取所有季度列表
 */
export async function GET() {
  try {
    const seasons = await db
      .select()
      .from(onePickSeasons)
      .orderBy(desc(onePickSeasons.startAt));

    return NextResponse.json(
      successResponse({
        seasons: seasons.map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
          startAt: s.startAt,
          endAt: s.endAt,
        })),
      })
    );
  } catch (error) {
    console.error('Seasons list error:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '服务器错误'),
      { status: 500 }
    );
  }
}
