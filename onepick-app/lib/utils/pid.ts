import { v4 as uuidv4 } from 'uuid';

/**
 * 生成匿名身份 PID
 */
export function generatePid(): string {
  return uuidv4();
}

/**
 * PID Cookie 名称
 */
export const PID_COOKIE_NAME = 'onepick_pid';

/**
 * PID LocalStorage Key
 */
export const PID_STORAGE_KEY = 'onepick_pid';
