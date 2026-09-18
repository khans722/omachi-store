import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export async function POST(req: NextRequest) {
  try {
    const orders = await db.orders.getAll();
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

    const body = await req.json().catch(() => ({}));
    const currentSettings = await db.settings.get();
    const settings = {
      ...currentSettings,
      ...(body.telegramBotToken ? { telegramBotToken: body.telegramBotToken } : {}),
      ...(body.telegramChatId ? { telegramChatId: body.telegramChatId } : {}),
      ...(body.websiteUrl ? { websiteUrl: body.websiteUrl } : {}),
      ...(body.enableTelegramNotify !== undefined ? { enableTelegramNotify: body.enableTelegramNotify } : {}),
    };

    const result = await sendOrderNotification(latest as any, settings, 'NEW_ORDER', undefined, { forceSend: true });
    
    if (result.telegram && result.telegram.success === false) {
      return NextResponse.json({ 
        success: false, 
        error: result.telegram.error || 'Lỗi gửi tin nhắn Telegram' 
      }, { status: 400 });
    }

    if (!settings.telegramBotToken || !settings.telegramChatId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID.' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Notification triggered', result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
