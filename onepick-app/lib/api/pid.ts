import { cookies } from 'next/headers';
import { generatePid, PID_COOKIE_NAME } from '../utils/pid';

/**
 * 从 Cookie 获取或创建 PID
 */
export async function getOrCreatePid(): Promise<string> {
  const cookieStore = await cookies();
  let pid = cookieStore.get(PID_COOKIE_NAME)?.value;
  
  if (!pid) {
    pid = generatePid();
    cookieStore.set(PID_COOKIE_NAME, pid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 年
    });
  }
  
  return pid;
}

/**
 * 从请求头获取 PID（不创建）
 */
export async function getPidFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PID_COOKIE_NAME)?.value || null;
}
