import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, password, address, city, email } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập họ và tên của bạn' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Mật khẩu cần tối thiểu 4 ký tự' }, { status: 400 });
    }

    const res = await db.customers.register({
      fullName: fullName.trim(),
      phone: phone.trim(),
      password: password.trim(),
      address: address?.trim() || '',
      city: city?.trim() || '',
      email: email?.trim() || '',
    });

    if (res.error) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    // Do not expose password back to frontend
    const safeCustomer = { ...res.customer };
    delete safeCustomer.password;

    return NextResponse.json({
      success: true,
      data: safeCustomer,
      message: 'Đăng ký tài khoản Omachi thành công! Chào mừng bạn 🌸',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi đăng ký' }, { status: 500 });
  }
}
