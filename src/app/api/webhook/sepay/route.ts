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
    const transferType = (body.transferType || body.transfer_type || 'in').toLowerCase();
    if (transferType !== 'in') {
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch tiền ra' });
    }

    const content = (body.content || body.description || body.code || body.order_code || '').toUpperCase();
    const transferAmount = Number(body.transferAmount || body.transfer_amount || body.amount || 0);

    if (!content) {
      return NextResponse.json({ success: false, message: 'Nội dung giao dịch trống' }, { status: 400 });
    }

    // Tìm mã đơn hàng từ nội dung: Hỗ trợ "OM-1234", "DH OM-1234", "DH 1234", "OM1234", "SEVQR DH OM-1234", "SEVQR 1234"
    const omMatch = content.match(/OM[-\s]?([0-9A-Z]{4,})/i) || content.match(/OM[-\s]?([0-9A-Z]+)/i);
    const dhMatch = content.match(/DH[-\s]?OM?[-\s]?([0-9A-Z]+)/i);
    const sevqrMatch = content.match(/SEVQR.*?(\d{4,})/i);
    const raw4DigitMatch = content.match(/(\d{4,})/);

    let extractedCode = '';
    if (omMatch && omMatch[1]) {
      const p = omMatch[1].toUpperCase();
      extractedCode = p.startsWith('OM') ? p : `OM-${p}`;
    } else if (dhMatch && dhMatch[1]) {
      const p = dhMatch[1].toUpperCase();
      extractedCode = p.startsWith('OM') ? p : `OM-${p}`;
    } else if (sevqrMatch && sevqrMatch[1]) {
      extractedCode = `OM-${sevqrMatch[1]}`;
    } else if (raw4DigitMatch && raw4DigitMatch[1]) {
      extractedCode = `OM-${raw4DigitMatch[1]}`;
    }

    if (!extractedCode) {
      console.log('[SEPAY WEBHOOK]: Không tìm thấy mã đơn OM trong nội dung:', content);
      return NextResponse.json({
        success: true,
        message: 'Giao dịch không chứa mã đơn OM-xxxx',
      });
    }

    // Tra cứu đơn hàng trong database
    const cleanExtracted = extractedCode.replace(/^#/, '').trim();
    const targetDigits = cleanExtracted.replace(/[^0-9]/g, '');

    let order = await db.orders.getById(cleanExtracted);

    if (!order) {
      const allOrders = await db.orders.getAll();
      order = allOrders.find((o) => {
        const oClean = (o.code || '').replace(/^#/, '').trim().toUpperCase();
        const oIdClean = (o.id || '').replace(/^#/, '').trim().toUpperCase();
        const oDigits = (o.code || '').replace(/[^0-9]/g, '');
        return (
          oClean === cleanExtracted ||
          oIdClean === cleanExtracted ||
          (targetDigits.length >= 4 && oDigits === targetDigits)
        );
      });
    }

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
