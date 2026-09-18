import { Order, ShopSettings } from '@/types';
import { formatVND } from './utils';
import { getPaymentConfirmToken } from './paymentToken';

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send notification to Telegram webhook when an order is created or status changes
 */
export async function sendOrderNotification(
  order: Order,
  settings: ShopSettings,
  trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING' | 'CANCELLED',
  requestOrigin?: string,
  options?: { forceSend?: boolean }
) {
  const isCancelled = order.orderStatus === 'CANCELLED' || trigger === 'CANCELLED';
  const isPaid = (order.paymentStatus === 'PAID' || trigger === 'PAYMENT_SUCCESS') && !isCancelled;
  const isPrepaid = (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && !isCancelled;

  // PHƯƠNG ÁN 1:
  // 1. Khách vừa tạo đơn Chuyển khoản (BANK / MOMO) nhưng CHƯA thanh toán:
  //    -> Bỏ qua không gửi Telegram (tránh tin rác/đặt thử). Chỉ gửi khi SePay báo tiền về tài khoản.
  if (trigger === 'NEW_ORDER' && isPrepaid && !isPaid && !options?.forceSend) {
    console.log(`[TELEGRAM]: Bỏ qua thông báo đơn #${order.code} (đơn Chuyển khoản đang chờ khách thanh toán).`);
    return { success: true, skipped: true, reason: 'Chờ khách chuyển khoản' };
  }

  // 2. Đơn Chuyển khoản chưa từng thanh toán mà bị hủy:
  //    -> Bỏ qua không gửi Telegram (vì shop chưa từng nhận tin đơn này, tránh làm phiền).
  if (isCancelled && (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && order.paymentStatus !== 'PAID' && !options?.forceSend) {
    console.log(`[TELEGRAM]: Bỏ qua thông báo hủy đơn #${order.code} (đơn Chuyển khoản chưa từng thanh toán).`);
    return { success: true, skipped: true, reason: 'Đơn chuyển khoản chưa thanh toán bị hủy' };
  }

  const cleanFullName = escapeHtml(order.customer?.fullName || 'Khách hàng');
  const cleanPhone = escapeHtml(order.customer?.phone || '');
  const cleanAddress = escapeHtml(order.customer?.address || '');
  const cleanNote = escapeHtml(order.customer?.note || '');

  const itemsHtml = (order.items || [])
    .map((item: any, idx: number) => {
      const name = escapeHtml(item.productName || item.product?.name || 'Mẫu Charm');
      const variant = escapeHtml(item.variantName || item.selectedVariant?.name || '');
      const qty = item.quantity || 1;
      const total = item.totalPrice || 0;
      const pkg = escapeHtml(item.selectedPackage?.name || '');
      const details = [variant, pkg ? `Quy cách: ${pkg}` : ''].filter(Boolean).join(' • ');
      return `   ${idx + 1}. <b>${name}</b> ${details ? `(${details})` : ''} x${qty} gói = <b>${formatVND(total)}</b>`;
    })
    .join('\n');

  const envUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')).replace(/\/$/, '');
  const configUrl = ((settings as any).websiteUrl || '').replace(/\/$/, '');
  const reqUrl = (requestOrigin || '').replace(/\/$/, '');

  // Tự động nhận diện domain thật khi đã deploy lên mạng
  let baseUrl = 'https://omachi-store-theta.vercel.app';
  if (configUrl && !configUrl.includes('localhost')) {
    baseUrl = configUrl;
  } else if (reqUrl && !reqUrl.includes('localhost')) {
    baseUrl = reqUrl;
  } else if (envUrl && !envUrl.includes('localhost')) {
    baseUrl = envUrl;
  }

  const orderViewUrl = `${baseUrl}/order/${order.code || order.id}`;
  const adminUrl = `${baseUrl}/admin`;

  let title = '';
  let methodText = '';
  let paymentStatusText = '';
  let shippingFeeText = '';
  let shopNoteText = '';

  if (isCancelled) {
    title = `❌ <b>[ĐƠN ĐÃ HỦY] - ĐƠN HÀNG #${order.code}</b> ❌`;
    methodText = order.paymentMethod === 'BANK' ? '💳 Chuyển khoản VietQR' : '💵 Thu tiền mặt COD';
    paymentStatusText = '❌ <b>ĐÃ HỦY ĐƠN HÀNG</b>';
    shippingFeeText = '0đ';
    shopNoteText = `⚠️ <b>LÝ DO HỦY:</b> ${escapeHtml(order.cancelReason || 'Khách hàng / Shop đã hủy đơn')}\n<i>(Số lượng tồn kho sản phẩm đã được tự động hoàn trả lại)</i>`;
  } else if (isPaid) {
    title = `🎉 <b>[ĐÃ NHẬN TIỀN THÀNH CÔNG] - ĐƠN #${order.code}</b> ✅`;
    methodText = '💳 Chuyển khoản VietQR (SEPAY TỰ ĐỘNG KHỚP)';
    paymentStatusText = `✅ <b>ĐÃ THANH TOÁN ĐỦ TIỀN (+${formatVND(order.finalTotalAmount || order.totalAmount)})</b>`;
    shippingFeeText = '🎁 <b>0đ</b> <i>(Miễn phí ship)</i>';
    shopNoteText = `✨ <b>TIỀN ĐÃ VỀ TÀI KHOẢN QUA SEPAY:</b> Hợp lệ 100%! Shop an tâm đóng hàng và bàn giao cho bưu tá SPX!`;
  } else if (isPrepaid) {
    title = `⏳ <b>[CHỜ CHUYỂN KHOẢN] - ĐƠN HÀNG MỚI #${order.code}</b> ⚠️`;
    methodText = '💳 Chuyển khoản VietQR (Chờ khách quét mã QR)';
    paymentStatusText = '⛔ <b>CHƯA THANH TOÁN - CHƯA NHẬN TIỀN!</b>';
    shippingFeeText = '0đ <i>(Tạm tính Freeship theo ưu đãi CK)</i>';
    shopNoteText = `🚨 <b>CẢNH BÁO CHO SHOP:</b> Khách vừa tạo mã QR trên web. <b>KHÔNG ĐÓNG GỬI HÀNG</b> cho đến khi nhận được tin nhắn báo <b>"ĐÃ NHẬN TIỀN THÀNH CÔNG"</b> từ SePay!\n<i>(Hệ thống sẽ tự động hủy sau 24h nếu khách không chuyển khoản)</i>`;
  } else {
    // Đơn COD
    title = `📦 <b>[ĐƠN COD - THU TIỀN TẬN NƠI] - ĐƠN HÀNG MỚI #${order.code}</b> 🚚`;
    methodText = '💵 Thanh toán COD (Tiền mặt khi nhận hàng)';
    paymentStatusText = '📦 <b>ĐƠN COD - Shipper SPX thu tiền khi giao</b>';
    shippingFeeText = order.shippingFee ? `<b>${formatVND(order.shippingFee)}</b>` : '15.000đ';
    shopNoteText = `💡 <b>ĐƠN COD HỢP LỆ:</b> Shop tiến hành in đơn và đóng gói giao bưu tá SPX. Shipper sẽ thu <b>${formatVND(order.finalTotalAmount || order.totalAmount)}</b> khi giao tận tay khách.`;
  }

  const messageHtml = `
${title}
----------------------------------------
🧾 <b>Mã đơn:</b> #${order.code}
👤 <b>Khách hàng:</b> ${cleanFullName}
📞 <b>Số điện thoại:</b> ${cleanPhone}
📍 <b>Địa chỉ:</b> ${cleanAddress}
${cleanNote ? `📝 <b>Ghi chú:</b> <i>"${cleanNote}"</i>\n` : ''}
🛒 <b>Danh sách sản phẩm:</b>
${itemsHtml}

💰 <b>Tiền hàng:</b> ${formatVND(order.subtotal || (order as any).subtotalAmount || (order.totalAmount - (order.shippingFee || 0)))}
🚚 <b>Phí ship:</b> ${shippingFeeText}
💵 <b>TỔNG TIỀN:</b> <b>${formatVND(order.finalTotalAmount || order.totalAmount)}</b>
💳 <b>Phương thức:</b> ${methodText}
📌 <b>Trạng thái:</b> ${paymentStatusText}

${shopNoteText}

⏰ <b>Thời gian:</b> ${new Date(order.createdAt).toLocaleString('vi-VN')}
----------------------------------------
👉 <a href="${orderViewUrl}"><b>Bấm vào đây để xem chi tiết đơn #${order.code}</b></a>
👉 <a href="${adminUrl}"><b>Bấm vào đây để mở Trang Quản Trị Shop</b></a>
`;

  console.log('[NOTIFICATION LOG]:\n', messageHtml);

  let telegramResult: { success: boolean; error?: string } | null = null;

  // GỬI THÔNG BÁO VỀ TELEGRAM NẾU ĐÃ CẤU HÌNH TOKEN & CHAT ID
  if (settings.telegramBotToken && settings.telegramChatId && settings.enableTelegramNotify !== false) {
    try {
      const cleanDigits = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const zaloChatUrl = `https://zalo.me/${cleanDigits}`;

      const confirmToken = getPaymentConfirmToken(order.code, settings.telegramBotToken || '');
      const confirmPayUrl = `${baseUrl}/api/orders/confirm-payment?code=${order.code}&token=${confirmToken}`;

      // Nút bấm tương tác trực tiếp dưới tin nhắn Telegram
      const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];

      // Nút 1 chạm duyệt đã nhận tiền cho đơn Chuyển khoản VietQR chưa thanh toán
      if (isPrepaid && !isPaid && !isCancelled) {
        inlineKeyboard.push([
          {
            text: `✅ XÁC NHẬN ĐÃ NHẬN TIỀN (+${formatVND(order.finalTotalAmount || order.totalAmount)})`,
            url: confirmPayUrl,
          },
        ]);
      }

      // Nút xem chi tiết đơn hàng
      inlineKeyboard.push([
        { text: `📦 Xem & Theo Dõi Đơn #${order.code}`, url: orderViewUrl },
      ]);

      // Nút chat Zalo với khách
      if (cleanDigits) {
        inlineKeyboard.push([
          { text: `💬 Mở Chat Zalo Với Khách (${cleanDigits})`, url: zaloChatUrl },
        ]);
      }

      const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId.trim(),
          text: messageHtml,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        }),
      });

      const resJson = await res.json();
      if (!resJson.ok) {
        console.error('[TELEGRAM BOT HTML ERROR, retrying plain text]:', resJson);
        // Fallback plain text if HTML tags ever fail
        const plainFallback = messageHtml.replace(/<[^>]*>?/gm, '');
        const retryRes = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId.trim(),
            text: plainFallback,
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          }),
        });
        const retryJson = await retryRes.json();
        telegramResult = { success: retryJson.ok, error: retryJson.description };
      } else {
        console.log('[TELEGRAM BOT SUCCESS]: Message sent to chat', settings.telegramChatId);
        telegramResult = { success: true };
      }
    } catch (tgErr: any) {
      console.error('[TELEGRAM BOT FAILED]:', tgErr);
      telegramResult = { success: false, error: tgErr?.message || String(tgErr) };
    }
  }

  return { success: true, messageText: messageHtml, telegram: telegramResult };
}
