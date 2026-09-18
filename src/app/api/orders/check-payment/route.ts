import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPaymentConfirmToken } from '@/lib/paymentToken';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { checkAndSyncSepayForOrder } from '@/lib/sepay';

/**
 * API kiểm tra trạng thái thanh toán đơn hàng VietQR
 * Khi khách bấm "Tôi đã chuyển khoản xong • Kiểm tra ngay" trên giao diện web:
 * 1. Tra cứu trực tiếp từ Supabase để lấy trạng thái mới nhất
 * 2. Nếu chưa PAID, chủ động gọi SePay User API để quét xem ngân hàng đã nhận tiền chưa
 * 3. Nếu đã PAID: trả về isPaid: true ngay lập tức để màn hình nhảy sang Thành Công 🎉
 * 4. Nếu vẫn chưa có tiền: gửi thông báo hỏa tốc về Telegram của chủ shop để shop duyệt
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderIdOrCode = (body.orderId || body.code || body.id || '').toString().trim();

    if (!orderIdOrCode) {
      return NextResponse.json({ success: false, message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const clean = orderIdOrCode.replace(/^#/, '').trim();
    let order = await db.orders.getById(clean);

    if (!order) {
      return NextResponse.json({ success: false, message: `Không tìm thấy đơn hàng #${clean}` }, { status: 404 });
    }

    // 1. Nếu đơn hàng đã được cập nhật sang PAID (qua SePay Webhook hoặc Shop duyệt)
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        order,
        message: 'Đơn hàng đã được xác nhận thanh toán thành công!',
      });
    }

    // 2. Chủ động quét SePay Transactions API nếu đơn chưa PAID
    const sepaySync = await checkAndSyncSepayForOrder(order);
    if (sepaySync.isPaid && sepaySync.order) {
      return NextResponse.json({
        success: true,
        isPaid: true,
        order: sepaySync.order,
        message: 'SePay đã tự động khớp thanh toán thành công!',
      });
    }

    // 3. Nếu chưa khớp tiền từ SePay: Gửi thông báo hỏa tốc qua Telegram cho shop
    const settings = await db.settings.get();
    if (settings.telegramBotToken && settings.telegramChatId && settings.enableTelegramNotify !== false) {
      const confirmToken = getPaymentConfirmToken(order.code, settings.telegramBotToken);
      const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
      const requestOrigin = host ? `${protocol}://${host}` : req.nextUrl.origin;

      const envUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')).replace(/\/$/, '');
      const configUrl = ((settings as any).websiteUrl || '').replace(/\/$/, '');
      let baseUrl = 'https://omachi-store-theta.vercel.app';
      if (configUrl && !configUrl.includes('localhost')) baseUrl = configUrl;
      else if (requestOrigin && !requestOrigin.includes('localhost')) baseUrl = requestOrigin;
      else if (envUrl && !envUrl.includes('localhost')) baseUrl = envUrl;

      const adminUrl = `${baseUrl}/admin`;
      const amount = Number(order.finalTotalAmount || order.totalAmount || 0);

      const alertHtml = `
⚡🚨 <b>[KHÁCH BÁO ĐÃ CHUYỂN KHOẢN] - ĐƠN #${order.code}</b> 🚨⚡
----------------------------------------
👤 <b>Khách hàng:</b> ${order.customer?.fullName || 'Khách'}
📞 <b>Điện thoại:</b> ${order.customer?.phone || ''}
💰 <b>Số tiền:</b> <b>${formatVND(amount)}</b>
💳 <b>Phương thức:</b> Chuyển khoản VietQR (${settings.bankId || 'VietinBank'} - ${settings.bankAccount || ''})
📝 <b>Nội dung chuyển khoản:</b> <code>SEVQR DH ${order.code}</code>

💡 <i>Hệ thống SePay đang tự động đối soát số dư. Để xác nhận thủ công, vui lòng đăng nhập Trang Quản Trị:</i>
----------------------------------------
👉 <a href="${adminUrl}"><b>MỞ TRANG QUẢN TRỊ SHOP (ADMIN)</b></a>
`;

      try {
        await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId.trim(),
            text: alertHtml,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `🔐 Mở Trang Quản Trị Shop`,
                    url: adminUrl,
                  },
                ],
                [
                  {
                    text: `💬 Chat Zalo Với Khách (${(order.customer?.phone || '').replace(/[^0-9]/g, '')})`,
                    url: `https://zalo.me/${(order.customer?.phone || '').replace(/[^0-9]/g, '')}`,
                  },
                ],
              ],
            },
          }),
        });
      } catch (tgErr) {
        console.warn('[CHECK PAYMENT TELEGRAM ALERT ERROR]:', tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      order,
      message: 'Hệ thống đang kiểm tra biến động tài khoản và đã gửi thông báo đến xưởng Omachi để duyệt ngay!',
    });
  } catch (error: any) {
    console.error('[CHECK PAYMENT ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi kiểm tra thanh toán' },
      { status: 500 }
    );
  }
}
