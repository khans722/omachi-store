import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export async function GET() {
  const orders = db.orders.getAll();
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  let hasChanges = false;

  orders.forEach((o: any) => {
    if (
      (o.paymentMethod === 'BANK' || o.paymentMethod === 'MOMO') &&
      o.paymentStatus !== 'PAID' &&
      o.orderStatus === 'PENDING'
    ) {
      const createdTime = new Date(o.createdAt).getTime();
      if (!isNaN(createdTime) && now - createdTime > TWENTY_FOUR_HOURS) {
        db.orders.updateStatus(o.id, 'CANCELLED', 'UNPAID', undefined, undefined, undefined, {
          ...o,
          cancelReason: 'Hệ thống tự động hủy do quá hạn 24h chưa chuyển khoản thanh toán'
        });
        hasChanges = true;
      }
    }
  });

  const finalOrders = hasChanges ? db.orders.getAll() : orders;
  return NextResponse.json({ success: true, data: finalOrders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a sync request from Admin/Client
    if (body.syncOrders && Array.isArray(body.syncOrders)) {
      const synced = db.orders.upsertBatch(body.syncOrders);
      return NextResponse.json({ success: true, data: synced });
    }

    const rawPhone = (body.customer?.phone || '').replace(/[^0-9]/g, '');
    const vnPhoneRegex = /^(0|84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!rawPhone || (!vnPhoneRegex.test(rawPhone) && (rawPhone.length < 9 || rawPhone.length > 12))) {
      return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const newOrder = db.orders.create(body);

    // Gửi thông báo về Telegram ngầm (Bất đồng bộ không chặn đơn của khách)
    // Giúp tốc độ đặt hàng cực nhanh < 0.1s thay vì phải đợi máy chủ Telegram phản hồi
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    const requestOrigin = host ? `${protocol}://${host}` : req.nextUrl.origin;

    const settings = db.settings.get();
    sendOrderNotification(newOrder, settings, 'NEW_ORDER', requestOrigin).catch((err) => {
      console.error('[ASYNC ORDER TELEGRAM NOTIFICATION ERROR]:', err);
    });

    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order in DB:', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.id || body.orderId || body.order?.id || body.order?.code;
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing order id' }, { status: 400 });
    }

    const fallbackOrder = body.order || body.orderData;
    const updated = db.orders.updateStatus(
      orderId,
      body.orderStatus,
      body.paymentStatus,
      body.carrierName,
      body.trackingNumber,
      body.shippingFee,
      fallbackOrder
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Send notification update in background
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    const requestOrigin = host ? `${protocol}://${host}` : req.nextUrl.origin;

    const trigger = body.paymentStatus === 'PAID' ? 'PAYMENT_SUCCESS' : 'CONFIRMED';
    const settings = db.settings.get();
    sendOrderNotification(updated, settings, trigger, requestOrigin).catch((err) => {
      console.error('[ASYNC ORDER UPDATE NOTIFICATION ERROR]:', err);
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
  }
}

