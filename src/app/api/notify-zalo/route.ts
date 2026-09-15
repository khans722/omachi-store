import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export async function POST(req: NextRequest) {
  try {
    const orders = db.orders.getAll();
    const latest = orders[0] || {
      id: 'test-order',
      code: 'OM-TEST',
      customer: {
        fullName: 'Khách Thử Nghiệm Omachi',
        phone: '0375408256',
        address: 'Số 1 Phố Hàng Charm, Hà Nội',
        note: 'Đơn hàng thử nghiệm thông báo Telegram',
      },
      items: [
        {
          productName: 'Vòng Tay Cườm Vintage Custom',
          quantity: 1,
          totalPrice: 99000,
        }
      ],
      totalAmount: 99000,
      paymentMethod: 'ZALO_CONFIRM',
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING_CONFIRM',
      createdAt: new Date().toISOString(),
    };

    const settings = db.settings.get();
    const result = await sendOrderNotification(latest as any, settings, 'NEW_ORDER');
    return NextResponse.json({ success: true, message: 'Notification triggered', result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
