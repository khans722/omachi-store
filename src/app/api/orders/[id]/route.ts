import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await db.orders.getById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
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
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Send notification update in background
    let trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING' | 'CANCELLED' = 'CONFIRMED';
    if (body.orderStatus === 'CANCELLED' || updated.orderStatus === 'CANCELLED') {
      trigger = 'CANCELLED';
    } else if (body.paymentStatus === 'PAID') {
      trigger = 'PAYMENT_SUCCESS';
    }
    const settings = await db.settings.get();
    sendOrderNotification(updated, settings, trigger).catch((err) => {
      console.error('[ASYNC ORDER UPDATE NOTIFICATION ERROR]:', err);
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
  }
}

