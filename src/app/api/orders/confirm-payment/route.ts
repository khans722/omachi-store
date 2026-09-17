import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';
import { formatVND } from '@/lib/utils';
import { getPaymentConfirmToken } from '@/lib/paymentToken';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || '';
    const token = searchParams.get('token') || '';

    if (!code) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>⚠️ Thiếu mã đơn hàng</h2></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const settings = await db.settings.get();
    const expectedToken = getPaymentConfirmToken(code, settings.telegramBotToken || '');

    // Allow confirmation if token matches or bypass in internal admin
    if (token !== expectedToken) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>⛔ Liên kết xác nhận không hợp lệ hoặc đã hết hạn!</h2></body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Find order
    const allOrders = await db.orders.getAll();
    const cleanCode = code.toUpperCase().trim().replace(/^#/, '');
    const order = allOrders.find(
      (o) =>
        (o.code && o.code.toUpperCase().replace(/^#/, '').trim() === cleanCode) ||
        (o.id && o.id.toUpperCase().replace(/^#/, '').trim() === cleanCode)
    );

    if (!order) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>⚠️ Không tìm thấy đơn hàng #${code} trong hệ thống!</h2></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Update status to PAID
    const updated = await db.orders.updateStatus(
      order.id,
      order.orderStatus === 'PENDING_CONFIRM' ? 'PREPARING' : order.orderStatus,
      'PAID',
      order.carrierName,
      order.trackingNumber,
      order.shippingFee,
      order
    );

    // Notify Telegram that payment has been successfully confirmed
    if (updated) {
      sendOrderNotification(updated, settings, 'PAYMENT_SUCCESS').catch((err) => {
        console.error('[CONFIRM PAYMENT NOTIFICATION ERROR]:', err);
      });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') || '').replace(/\/$/, '');
    const orderUrl = `${appUrl}/order/${order.code || order.id}`;
    const adminUrl = `${appUrl}/admin`;

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Nhận Tiền Thành Công - #${order.code}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fdf2f8; color: #1f2937; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; max-width: 480px; width: 100%; border-radius: 28px; box-shadow: 0 20px 40px rgba(244, 114, 182, 0.15); border: 1px solid #fbcfe8; padding: 32px 24px; text-align: center; }
    .icon { width: 72px; height: 72px; background: #ecfdf5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 16px; border: 2px solid #a7f3d0; }
    h1 { font-size: 20px; font-weight: 900; color: #065f46; margin-bottom: 8px; }
    p { font-size: 13px; color: #6b7280; line-height: 1.5; }
    .info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 18px; padding: 16px; margin: 20px 0; text-align: left; font-size: 13px; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .val { font-weight: 700; color: #111827; }
    .amount { color: #e11d48; font-size: 16px; font-weight: 900; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-top: 4px; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 14px; text-decoration: none; margin-top: 10px; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #e11d48, #f43f5e); color: white; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25); }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>ĐÃ XÁC NHẬN NHẬN TIỀN!</h1>
    <p>Đơn hàng <strong>#${order.code}</strong> đã được cập nhật sang trạng thái <strong>ĐÃ THANH TOÁN</strong>.</p>
    
    <div class="info">
      <div class="info-row">
        <span class="label">Mã đơn hàng:</span>
        <span class="val">#${order.code}</span>
      </div>
      <div class="info-row">
        <span class="label">Khách hàng:</span>
        <span class="val">${order.customer.fullName} (${order.customer.phone})</span>
      </div>
      <div class="info-row">
        <span class="label">Số tiền đã nhận:</span>
        <span class="val amount">${formatVND(order.finalTotalAmount || order.totalAmount)}</span>
      </div>
      <div class="info-row">
        <span class="label">Trạng thái mới:</span>
        <span class="val"><span class="badge">✓ ĐÃ THANH TOÁN (HỢP LỆ MIỄN SHIP)</span></span>
      </div>
    </div>

    <p style="font-size:12px;color:#9ca3af;margin-bottom:16px;">
      Tiến độ đơn đã tự động chuyển sang <strong>Đang chuẩn bị &amp; đóng gói</strong> để shop sẵn sàng làm hàng!
    </p>

    <a href="${orderUrl}" class="btn btn-primary">👉 Xem Trang Chi Tiết Đơn Hàng</a>
    <a href="${adminUrl}" class="btn btn-secondary">Trang Quản Trị Shop</a>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Lỗi xác nhận thanh toán:', error);
    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>❌ Lỗi hệ thống: ${error.message || error}</h2></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
