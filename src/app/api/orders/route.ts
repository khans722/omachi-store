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

    // Check if this is a sync request from Admin/Client
    if (body.syncOrders && Array.isArray(body.syncOrders)) {
      const synced = db.orders.upsertBatch(body.syncOrders);
      return NextResponse.json({ success: true, data: synced });
    }

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
    const trigger = body.paymentStatus === 'PAID' ? 'PAYMENT_SUCCESS' : 'CONFIRMED';
    const settings = db.settings.get();
    sendOrderNotification(updated, settings, trigger).catch((err) => {
      console.error('[ASYNC ORDER UPDATE NOTIFICATION ERROR]:', err);
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
  }
}

