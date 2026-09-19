import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';
import { verifyAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const orders = await db.orders.getAll();

  // Chuẩn hóa trạng thái đơn hàng trên RAM cực nhanh, không gọi cập nhật nặng nề làm nghẽn Admin
  const sanitized = (orders as any[]).map((o) => {
    if (
      (o.paymentMethod === 'BANK' || o.paymentMethod === 'MOMO') &&
      o.paymentStatus !== 'PAID' &&
      o.orderStatus !== 'CANCELLED' &&
      o.orderStatus !== 'PENDING_CONFIRM'
    ) {
      return { ...o, orderStatus: 'PENDING_CONFIRM' };
    }
    return o;
  });

  return NextResponse.json(
    { success: true, data: sanitized },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a sync request from Admin/Client
    if (body.syncOrders && Array.isArray(body.syncOrders)) {
      const synced = await db.orders.upsertBatch(body.syncOrders);
      return NextResponse.json({ success: true, data: synced });
    }

    const rawPhone = (body.customer?.phone || '').replace(/[^0-9]/g, '');
    const vnPhoneRegex = /^(0|84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!rawPhone || (!vnPhoneRegex.test(rawPhone) && (rawPhone.length < 9 || rawPhone.length > 12))) {
      return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const newOrder = await db.orders.create(body);

    // Gửi thông báo Telegram TRƯỚC KHI return để tránh bị Vercel kill function
    // (Vercel serverless đóng function ngay sau khi response trả về)
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    const requestOrigin = host ? `${protocol}://${host}` : req.nextUrl.origin;

    try {
      const settings = await db.settings.get();
      // Race với timeout 7.5s: đảm bảo Telegram API nhận và gửi xong trước khi đóng response
      await Promise.race([
        sendOrderNotification(newOrder, settings, 'NEW_ORDER', requestOrigin),
        new Promise((resolve) => setTimeout(resolve, 7500)),
      ]);
    } catch (notifyErr) {
      console.error('[ORDER TELEGRAM NOTIFICATION ERROR]:', notifyErr);
    }

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
    const extra = {
      cancelReason: body.cancelReason || body.cancel_reason,
      cancelledBy: body.cancelledBy || body.cancelled_by,
      restock: body.restock,
    };
    const updated = await db.orders.updateStatus(
      orderId,
      body.orderStatus,
      body.paymentStatus,
      body.carrierName,
      body.trackingNumber,
      body.shippingFee,
      fallbackOrder,
      extra
    );

    if (!updated) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng hoặc cập nhật trạng thái không thành công' 
      }, { status: 400 });
    }

    // Send notification update non-blocking in background
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    const requestOrigin = host ? `${protocol}://${host}` : req.nextUrl.origin;

    let trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING' | 'CANCELLED' = 'CONFIRMED';
    if (body.orderStatus === 'CANCELLED' || updated.orderStatus === 'CANCELLED') {
      trigger = 'CANCELLED';
    } else if (body.paymentStatus === 'PAID') {
      trigger = 'PAYMENT_SUCCESS';
    }

    db.settings.get().then((settings) => {
      sendOrderNotification(updated, settings, trigger as any, requestOrigin).catch((err) => {
        console.error('[ASYNC ORDER UPDATE NOTIFICATION ERROR]:', err);
      });
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    const msg = error?.message || 'Lỗi khi cập nhật trạng thái đơn hàng';
    const cleanMsg = msg.replace(/^[A-Z_]+:\s*/, '');
    return NextResponse.json({ success: false, message: cleanMsg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yêu cầu quyền Quản trị viên để xóa toàn bộ đơn hàng!' }, { status: 401 });
  }

  try {
    await db.orders.clearAll();
    return NextResponse.json({ 
      success: true, 
      message: 'Đã xóa sạch toàn bộ đơn hàng và khôi phục tồn kho mặc định thành công! ✨' 
    });
  } catch (error: any) {
    console.error('Error clearing orders:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi khi xóa đơn hàng: ' + (error?.message || error) 
    }, { status: 500 });
  }
}

