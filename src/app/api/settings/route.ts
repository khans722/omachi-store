import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const settings = await db.settings.get();
  
  // Đảm bảo không bao giờ để lộ thông tin xác thực admin ra ngoài
  const safeSettings = { ...settings };
  delete (safeSettings as any).adminAuth;

  return NextResponse.json(
    { success: true, data: safeSettings },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  // Khóa bảo vệ: Chỉ Admin có phiên đăng nhập hợp lệ mới được cập nhật cài đặt
  if (!verifyAdminAuth(req)) {
    return NextResponse.json(
      { success: false, message: 'Yêu cầu quyền Quản trị viên để lưu cài đặt!' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    // Không cho phép ghi đè adminAuth thông qua API settings thông thường
    delete body.adminAuth;
    
    const updated = await db.settings.update(body);
    const safeUpdated = { ...updated };
    delete (safeUpdated as any).adminAuth;

    return NextResponse.json({ success: true, data: safeUpdated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}
