import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất khỏi phiên quản trị thành công!',
  });

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });

  return res;
}
