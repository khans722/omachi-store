import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại' }, { status: 400 });
    }

    const res = await db.customers.login(phone.trim(), password ? password.trim() : undefined);

    if (res.error || !res.customer) {
      return NextResponse.json({ success: false, error: res.error || 'Đăng nhập thất bại' }, { status: 401 });
    }

    const safeCustomer = { ...res.customer };
    delete safeCustomer.password;

    return NextResponse.json({
      success: true,
      data: safeCustomer,
      message: `Đăng nhập thành công! Chào bạn ${safeCustomer.fullName} ✨`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi đăng nhập' }, { status: 500 });
  }
}
