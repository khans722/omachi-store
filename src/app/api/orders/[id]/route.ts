import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = db.orders.getById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const fallbackOrder = body.order || body.orderData;
    const updated = db.orders.updateStatus(
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

