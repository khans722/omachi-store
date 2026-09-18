import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { checkAndSyncSepayForOrder } from '@/lib/sepay';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let order = await db.orders.getById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  // Tự động đối soát SePay realtime nếu là đơn Chuyển khoản VietQR chưa thanh toán
  if (order.paymentMethod === 'BANK' && order.paymentStatus !== 'PAID') {
    try {
      const sepaySync = await checkAndSyncSepayForOrder(order as any);
      if (sepaySync.isPaid && sepaySync.order) {
        order = sepaySync.order as any;
      }
    } catch (e) {}
  }

  return NextResponse.json(
    { success: true, data: order },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const fallbackOrder = body.order || body.orderData;
    const updated = await db.orders.updateStatus(
      params.id,
      body.orderStatus,
      body.paymentStatus,
      body.carrierName,
      body.trackingNumber,
      body.shippingFee,
      fallbackOrder
    );

    if (!updated) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng hoặc cập nhật trạng thái không thành công' 
      }, { status: 400 });
    }

    // Gửi thông báo cập nhật đơn hàng trước khi return để tránh bị Vercel đóng kết nối
    let trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING' | 'CANCELLED' = 'CONFIRMED';
    if (body.orderStatus === 'CANCELLED' || updated.orderStatus === 'CANCELLED') {
      trigger = 'CANCELLED';
    } else if (body.paymentStatus === 'PAID') {
      trigger = 'PAYMENT_SUCCESS';
    }

    try {
      const settings = await db.settings.get();
      await Promise.race([
        sendOrderNotification(updated, settings, trigger),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch (err) {
      console.error('[ORDER UPDATE NOTIFICATION ERROR]:', err);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    const msg = error?.message || 'Lỗi khi cập nhật trạng thái đơn hàng';
    const cleanMsg = msg.replace(/^[A-Z_]+:\s*/, '');
    return NextResponse.json({ success: false, message: cleanMsg }, { status: 400 });
  }
}

