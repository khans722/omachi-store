import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export async function GET() {
  const orders = db.orders.getAll();
  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rawPhone = (body.customer?.phone || '').replace(/[^0-9]/g, '');
    const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!rawPhone || !vnPhoneRegex.test(rawPhone)) {
      return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const newOrder = db.orders.create(body);

    // Gửi thông báo về Telegram ngầm (Bất đồng bộ không chặn đơn của khách)
    // Giúp tốc độ đặt hàng cực nhanh < 0.1s thay vì phải đợi máy chủ Telegram phản hồi
    const settings = db.settings.get();
    sendOrderNotification(newOrder, settings, 'NEW_ORDER').catch((err) => {
      console.error('[ASYNC ORDER TELEGRAM NOTIFICATION ERROR]:', err);
    });

    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order in DB:', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}

