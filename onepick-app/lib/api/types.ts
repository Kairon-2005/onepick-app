/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 错误代码
 */
export const ErrorCodes = {
  // 订单号相关
  INVALID_ORDER_ID: 'INVALID_ORDER_ID',
  ORDER_ID_ALREADY_BOUND: 'ORDER_ID_ALREADY_BOUND',
  ORDER_ID_NOT_FOUND: 'ORDER_ID_NOT_FOUND',
  
  // PID 相关
  PID_REQUIRED: 'PID_REQUIRED',
  PID_ORDER_MISMATCH: 'PID_ORDER_MISMATCH',
  
  // 候选人相关
  INVALID_CANDIDATE_ID: 'INVALID_CANDIDATE_ID',
  
  // 季度相关
  SEASON_NOT_FOUND: 'SEASON_NOT_FOUND',
  SEASON_NOT_ACTIVE: 'SEASON_NOT_ACTIVE',
  
  // 投票相关
  VOTE_ALREADY_EXISTS: 'VOTE_ALREADY_EXISTS',
  VOTE_NOT_FOUND: 'VOTE_NOT_FOUND',
  
  // 修改相关
  CHANGE_LIMIT_REACHED: 'CHANGE_LIMIT_REACHED',
  INVALID_CHANGE_KEY: 'INVALID_CHANGE_KEY',
  
  // 通用
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * 创建成功响应
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * 创建错误响应
 */
export function errorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
