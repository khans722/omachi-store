import { NextRequest, NextResponse } from 'next/server';
import { getAdminConfig, verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập mật khẩu quản trị!' },
        { status: 400 }
      );
    }

    const adminConfig = await getAdminConfig();

    // Cho phép đăng nhập bằng username đúng (hoặc nếu chỉ nhập password thì kiểm tra password)
    const isUsernameMatch = !username || username.trim().toLowerCase() === adminConfig.username.toLowerCase();
    const isPasswordMatch = verifyPassword(password.trim(), adminConfig.passwordHash);

    if (!isUsernameMatch || !isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng thử lại.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(adminConfig.username);

    const res = NextResponse.json({
      success: true,
      token,
      message: 'Mở khóa quản trị thành công! Chào mừng chủ shop Omachi ✨',
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      secure: isProd,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi đăng nhập' },
      { status: 500 }
    );
  }
}
