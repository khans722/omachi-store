import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPaymentConfirmToken } from '@/lib/paymentToken';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API kiểm tra trạng thái thanh toán đơn hàng VietQR
 * Khi khách bấm "Tôi đã chuyển khoản xong • Kiểm tra ngay" trên giao diện web:
 * 1. Tra cứu trực tiếp từ Supabase để lấy trạng thái mới nhất
 * 2. Nếu đã PAID: trả về isPaid: true ngay lập tức để màn hình nhảy sang Thành Công 🎉
 * 3. Nếu chưa PAID: gửi thông báo hỏa tốc về Telegram của chủ shop kèm nút 1 chạm để chủ shop duyệt ngay
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderIdOrCode = (body.orderId || body.code || body.id || '').toString().trim();

    if (!orderIdOrCode) {
      return NextResponse.json({ success: false, message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const clean = orderIdOrCode.replace(/^#/, '').trim();
    const order = await db.orders.getById(clean);

    if (!order) {
      return NextResponse.json({ success: false, message: `Không tìm thấy đơn hàng #${clean}` }, { status: 404 });
    }

    // Nếu đơn hàng đã được cập nhật sang PAID (qua SePay hoặc qua Shop duyệt)
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        order,
        message: 'Đơn hàng đã được xác nhận thanh toán thành công!',
      });
    }

    // Nếu chưa PAID: Gửi thông báo hỏa tốc qua Telegram cho shop để shop check và bấm 1 chạm duyệt ngay
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

      const confirmPayUrl = `${baseUrl}/api/orders/confirm-payment?code=${order.code}&token=${confirmToken}`;
      const amount = Number(order.finalTotalAmount || order.totalAmount || 0);

      const alertHtml = `
⚡🚨 <b>[KHÁCH BÁO ĐÃ CHUYỂN KHOẢN] - ĐƠN #${order.code}</b> 🚨⚡
----------------------------------------
👤 <b>Khách hàng:</b> ${order.customer?.fullName || 'Khách'}
📞 <b>Điện thoại:</b> ${order.customer?.phone || ''}
💰 <b>Số tiền:</b> <b>${formatVND(amount)}</b>
💳 <b>Phương thức:</b> Chuyển khoản VietQR (${settings.bankId || 'VietinBank'} - ${settings.bankAccount || ''})
📝 <b>Nội dung chuyển khoản:</b> <code>SEVQR DH ${order.code}</code>

💡 <i>Khách hàng vừa bấm nút "Tôi đã chuyển khoản xong" trên website. Vui lòng kiểm tra app ngân hàng và bấm nút duyệt dưới đây:</i>
----------------------------------------
👉 <a href="${confirmPayUrl}"><b>BẤM VÀO ĐÂY ĐỂ XÁC NHẬN ĐÃ NHẬN TIỀN</b></a>
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
                    text: `✅ DUYỆT ĐÃ NHẬN TIỀN NGAY (+${formatVND(amount)})`,
                    url: confirmPayUrl,
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
