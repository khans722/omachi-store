import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

/**
 * SePay Automatic Bank Transfer Webhook
 * Tự động nhận biến động số dư tài khoản ngân hàng (Vietcombank, MB, ACB, Techcombank...)
 * Khi có giao dịch nạp tiền khớp cú pháp "DH OM-xxxx" hoặc "OM-xxxx", hệ thống tự động:
 * 1. Chuyển trạng thái đơn hàng sang PAID (Đã thanh toán)
 * 2. Đổi tiến độ đơn sang PREPARING (Đang chuẩn bị hàng)
 * 3. Bắn thông báo Telegram về cho shop: ĐÃ XÁC NHẬN THANH TOÁN TỰ ĐỘNG THÀNH CÔNG!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[SEPAY WEBHOOK RECEIVED]:', JSON.stringify(body));

    // Kiểm tra loại giao dịch: Chỉ xử lý giao dịch tiền vào (transferType = "in")
    if (body.transferType && body.transferType !== 'in') {
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch tiền ra' });
    }

    const content = (body.content || body.description || '').toUpperCase();
    const transferAmount = Number(body.transferAmount || body.amount || 0);

    if (!content) {
      return NextResponse.json({ success: false, message: 'Nội dung giao dịch trống' }, { status: 400 });
    }

    // Tìm mã đơn hàng từ nội dung: Hỗ trợ "OM-1234", "DH OM-1234", "DH 1234", "OM1234"
    const omMatch = content.match(/OM[-\s]?([0-9A-Z]+)/i);
    const dhMatch = content.match(/DH[-\s]?([0-9A-Z]+)/i);

    let extractedCode = '';
    if (omMatch && omMatch[1]) {
      extractedCode = `OM-${omMatch[1]}`.toUpperCase();
    } else if (dhMatch && dhMatch[1]) {
      const part = dhMatch[1].toUpperCase();
      extractedCode = part.startsWith('OM') ? part : `OM-${part}`;
    }

    if (!extractedCode) {
      console.log('[SEPAY WEBHOOK]: Không tìm thấy mã đơn OM trong nội dung:', content);
      return NextResponse.json({
        success: true,
        message: 'Giao dịch không chứa mã đơn OM-xxxx',
      });
    }

    // Tra cứu đơn hàng trong database
    const allOrders = await db.orders.getAll();
    const cleanExtracted = extractedCode.replace(/^#/, '').trim();
    const order = allOrders.find(
      (o) =>
        (o.code && o.code.toUpperCase().replace(/^#/, '').trim() === cleanExtracted) ||
        (o.id && o.id.toUpperCase().replace(/^#/, '').trim() === cleanExtracted)
    );

    if (!order) {
      console.warn('[SEPAY WEBHOOK]: Không tìm thấy đơn trong DB với mã:', extractedCode);
      return NextResponse.json({
        success: true,
        message: `Không tìm thấy đơn hàng #${extractedCode}`,
      });
    }

    // Kiểm tra số tiền chuyển khoản
    const expectedAmount = Number(order.finalTotalAmount || order.totalAmount || 0);
    if (transferAmount > 0 && transferAmount < expectedAmount) {
      console.warn(`[SEPAY WEBHOOK]: Khách chuyển thiếu tiền. Nhận: ${transferAmount}, Cần: ${expectedAmount}`);
      // Vẫn ghi nhận nhưng không đổi sang PAID hoàn toàn, hoặc ghi chú vào log
    }

    // Cập nhật trạng thái đơn sang PAID
    const updated = await db.orders.updateStatus(
      order.id,
      order.orderStatus === 'PENDING_CONFIRM' ? 'PREPARING' : order.orderStatus,
      'PAID',
      order.carrierName,
      order.trackingNumber,
      order.shippingFee,
      order
    );

    // Gửi thông báo Telegram cho chủ shop
    const settings = await db.settings.get();
    if (updated) {
      await sendOrderNotification(updated, settings, 'PAYMENT_SUCCESS').catch((err) => {
        console.error('[SEPAY TELEGRAM NOTIFICATION ERROR]:', err);
      });
    }

    console.log(`[SEPAY WEBHOOK SUCCESS]: Đã xác nhận tự động thanh toán đơn #${order.code}!`);
    return NextResponse.json({
      success: true,
      message: `Đã tự động xác nhận thanh toán đơn #${order.code}`,
      orderCode: order.code,
    });
  } catch (error: any) {
    console.error('[SEPAY WEBHOOK ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Omachi SePay Webhook Endpoint',
    version: '2.0',
    description: 'Endpoint nhận tự động biến động số dư ngân hàng qua SePay',
  });
}
