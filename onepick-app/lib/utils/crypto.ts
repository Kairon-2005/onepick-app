import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

/**
 * 生成修改密钥
 * 格式：XXXX-XXXX-XXXX（12位随机字符）
 */
export function generateChangeKey(): string {
  const key = randomBytes(6).toString('hex').toUpperCase();
  return `${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}`;
}

/**
 * 对密钥进行 hash（用于存储）
 */
export async function hashChangeKey(key: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(key, salt);
}

/**
 * 验证密钥
 */
export async function verifyChangeKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}
