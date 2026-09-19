import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'omachi-handmade-store-admin-session-secret-salt-2026';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ADMIN_COOKIE_NAME = 'omachi_admin_session';

// Mật khẩu ban đầu mặc định nếu chưa cấu hình
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'omachi888';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(password.trim()).digest('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) {
    return password === DEFAULT_ADMIN_PASSWORD || password === '123456';
  }
  const computedHash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}

export async function getAdminConfig(): Promise<{ username: string; passwordHash: string }> {
  try {
    const settings = await db.settings.get();
    const rawData = (settings as any)?.adminAuth || {};
    const username = rawData.username || DEFAULT_ADMIN_USERNAME;
    const passwordHash = rawData.passwordHash || hashPassword(DEFAULT_ADMIN_PASSWORD);
    return { username, passwordHash };
  } catch (e) {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    };
  }
}

export async function saveAdminPassword(newPassword: string): Promise<boolean> {
  try {
    const newHash = hashPassword(newPassword);
    const settings = await db.settings.get();
    const updatedAdminAuth = {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.update({
      adminAuth: updatedAdminAuth,
    } as any);
    return true;
  } catch (e) {
    console.error('Failed to save admin password:', e);
    return false;
  }
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  const payload = `${username}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const [username, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);
    if (!expiresAt || Date.now() > expiresAt) return false;

    const expectedPayload = `${username}:${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(expectedPayload).digest('hex');

    if (signature.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Kiểm tra quyền Admin từ Server Request (Cookie hoặc Header Authorization)
 */
export function verifyAdminAuth(req: NextRequest): boolean {
  // 1. Kiểm tra Cookie HTTP-Only
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken && verifySessionToken(cookieToken)) {
    return true;
  }

  // 2. Kiểm tra Header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifySessionToken(token)) return true;
  }

  // 3. Kiểm tra Header x-admin-token
  const customHeader = req.headers.get('x-admin-token');
  if (customHeader && verifySessionToken(customHeader.trim())) {
    return true;
  }

  return false;
}
