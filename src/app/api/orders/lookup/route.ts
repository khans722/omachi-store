import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId') || undefined;
    const query = searchParams.get('query') || searchParams.get('phone') || searchParams.get('code') || '';

    if (!customerId && (!query || !query.trim())) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại hoặc mã đơn hàng để tra cứu' }, { status: 400 });
    }

    const orders = await db.orders.lookup(query, customerId);

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi tra cứu đơn hàng' }, { status: 500 });
  }
}
