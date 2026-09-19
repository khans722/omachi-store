import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, getAdminConfig, verifyPassword, saveAdminPassword } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực quyền Admin
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập lại!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo an toàn!' },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' },
        { status: 400 }
      );
    }

    // 2. Xác minh mật khẩu hiện tại
    const adminConfig = await getAdminConfig();
    const isCurrentValid = verifyPassword(currentPassword.trim(), adminConfig.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu hiện tại không đúng! Vui lòng kiểm tra lại.' },
        { status: 400 }
      );
    }

    // 3. Lưu mật khẩu mới
    const ok = await saveAdminPassword(newPassword.trim());
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Lỗi khi lưu mật khẩu mới vào máy chủ!' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu Admin thành công! Mật khẩu mới đã có hiệu lực ngay lập tức. ✨',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi đổi mật khẩu' },
      { status: 500 }
    );
  }
}
