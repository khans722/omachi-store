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

function formatVietnamDateTime(dateStr?: string | Date): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    }).format(d);
  } catch (e) {
    return new Date().toLocaleString('vi-VN');
  }
}

  const cleanFullName = escapeHtml(order.customer?.fullName || 'Khách hàng');
  const cleanPhone = escapeHtml(order.customer?.phone || '');
  const cleanAddress = escapeHtml(order.customer?.address || '');
  const cleanNote = escapeHtml(order.customer?.note || '');
  const vnTime = formatVietnamDateTime(order.createdAt);
  const totalAmountFormatted = formatVND(order.finalTotalAmount || order.totalAmount);
  const itemsCount = (order.items || []).reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0);

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const name = escapeHtml(item.productName || item.product?.name || 'Mẫu Charm');
      const variant = escapeHtml(item.variantName || item.selectedVariant?.name || '');
      const qty = item.quantity || 1;
      const total = item.totalPrice || 0;
      const details = variant ? ` <i>(${variant})</i>` : '';
      return `• <b>${name}</b>${details} x${qty} = <b>${formatVND(total)}</b>`;
    })
    .join('\n');

  // Luôn luôn ưu tiên domain chính thức public, không bao giờ dùng domain preview nội bộ của Vercel (bị chặn xác thực Vercel Auth)
  const canonicalDomain = 'https://omachi-store-theta.vercel.app';
  const customDomain = ((settings as any).websiteUrl || '').trim().replace(/\/$/, '');

  let baseUrl = canonicalDomain;
  if (customDomain && !customDomain.includes('localhost') && !customDomain.includes('127.0.0.1')) {
    baseUrl = customDomain;
  } else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  const cleanOrderCode = (order.code || order.id || '').replace(/^#/, '').trim();
  const orderViewUrl = `${baseUrl}/order/${encodeURIComponent(cleanOrderCode)}`;
  const adminUrl = `${baseUrl}/admin`;

  const footerLinksHtml = `
----------------------------------------
👉 <a href="${orderViewUrl}"><b>Bấm để xem chi tiết đơn #${cleanOrderCode}</b></a>
👉 <a href="${adminUrl}"><b>Bấm để mở Trang Quản Trị Shop</b></a>
`.trim();

  let messageHtml = '';

  if (isCancelled) {
    messageHtml = `
❌ <b>ĐƠN HÀNG ĐÃ HỦY</b>
━━━━━━━━━━━━━━━━━━━━
🧾 <b>Mã đơn:</b> <code>#${order.code}</code>
💵 <b>Giá trị đơn:</b> ${totalAmountFormatted}
⚠️ <b>Lý do hủy:</b> ${escapeHtml(order.cancelReason || 'Khách hàng / Shop đã hủy đơn')}
⏰ <b>Thời gian:</b> ${vnTime}

👤 <b>Khách hàng:</b> ${cleanFullName}
📞 <b>Điện thoại:</b> <code>${cleanPhone}</code>
📍 <b>Địa chỉ:</b> ${cleanAddress}
${cleanNote ? `📝 <b>Ghi chú:</b> <i>"${cleanNote}"</i>\n` : ''}
♻️ <i>Số lượng tồn kho sản phẩm đã được tự động hoàn lại.</i>

${footerLinksHtml}
`.trim();
  } else if (isPaid) {
    messageHtml = `
🎉 <b>TIỀN ĐÃ VỀ • ĐÃ THANH TOÁN</b>
━━━━━━━━━━━━━━━━━━━━
🧾 <b>Mã đơn:</b> <code>#${order.code}</code>
💵 <b>Số tiền nhận:</b> <b>${totalAmountFormatted}</b> <i>(Chuyển khoản VietQR)</i>
⏰ <b>Thời gian:</b> ${vnTime}

👤 <b>Khách hàng:</b> ${cleanFullName}
📞 <b>Điện thoại:</b> <code>${cleanPhone}</code>
📍 <b>Địa chỉ:</b> ${cleanAddress}
${cleanNote ? `📝 <b>Ghi chú:</b> <i>"${cleanNote}"</i>\n` : ''}
🛒 <b>Sản phẩm (${itemsCount} món):</b>
${itemsHtml}

🚚 <b>Vận chuyển:</b> SPX Express (Freeship 0đ)
✨ <i>Tiền đã khớp SePay 100%. Shop an tâm đóng hàng gửi khách!</i>

${footerLinksHtml}
`.trim();
  } else if (isPrepaid) {
    messageHtml = `
⏳ <b>ĐƠN MỚI • CHỜ CHUYỂN KHOẢN</b>
━━━━━━━━━━━━━━━━━━━━
🧾 <b>Mã đơn:</b> <code>#${order.code}</code>
💵 <b>Cần thanh toán:</b> <b>${totalAmountFormatted}</b> <i>(VietQR)</i>
⏰ <b>Thời gian:</b> ${vnTime}

👤 <b>Khách hàng:</b> ${cleanFullName}
📞 <b>Điện thoại:</b> <code>${cleanPhone}</code>
📍 <b>Địa chỉ:</b> ${cleanAddress}
${cleanNote ? `📝 <b>Ghi chú:</b> <i>"${cleanNote}"</i>\n` : ''}
🛒 <b>Sản phẩm (${itemsCount} món):</b>
${itemsHtml}

⚠️ <i>Chờ khách quét QR. KHÔNG gửi hàng cho đến khi SePay báo đã nhận tiền!</i>

${footerLinksHtml}
`.trim();
  } else {
    // Đơn COD
    const goodsSubtotal = formatVND(order.subtotal || (order as any).subtotalAmount || (order.totalAmount - (order.shippingFee || 0)));
    const shippingFeeStr = order.shippingFee ? formatVND(order.shippingFee) : '15.000đ';
    messageHtml = `
📦 <b>ĐƠN HÀNG MỚI • THU TIỀN COD</b>
━━━━━━━━━━━━━━━━━━━━
🧾 <b>Mã đơn:</b> <code>#${order.code}</code>
💵 <b>Cần thu khi giao:</b> <b>${totalAmountFormatted}</b>
⏰ <b>Thời gian:</b> ${vnTime}

👤 <b>Khách hàng:</b> ${cleanFullName}
📞 <b>Điện thoại:</b> <code>${cleanPhone}</code>
📍 <b>Địa chỉ:</b> ${cleanAddress}
${cleanNote ? `📝 <b>Ghi chú:</b> <i>"${cleanNote}"</i>\n` : ''}
🛒 <b>Sản phẩm (${itemsCount} món):</b>
${itemsHtml}

🚚 <b>Tiền hàng:</b> ${goodsSubtotal} • <b>Ship:</b> ${shippingFeeStr}
💡 <i>Shop đóng hàng giao bưu tá SPX. Shipper sẽ thu ${totalAmountFormatted} khi giao.</i>

${footerLinksHtml}
`.trim();
  }

  console.log('[NOTIFICATION LOG]:\n', messageHtml);

  let telegramResult: { success: boolean; error?: string } | null = null;

  // GỬI THÔNG BÁO VỀ TELEGRAM NẾU ĐÃ CẤU HÌNH TOKEN & CHAT ID
  if (settings.telegramBotToken && settings.telegramChatId && settings.enableTelegramNotify !== false) {
    try {
      const cleanDigits = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const zaloChatUrl = `https://zalo.me/${cleanDigits}`;

      // Nút bấm tương tác trực tiếp dưới tin nhắn Telegram
      const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];

      // Hàng 1: Nút xem chi tiết đơn hàng
      inlineKeyboard.push([
        { text: `📦 Xem Đơn Hàng #${cleanOrderCode}`, url: orderViewUrl },
      ]);

      // Hàng 2: Nút chat Zalo & Nút mở trang Admin
      const row2: Array<{ text: string; url: string }> = [];
      if (cleanDigits) {
        row2.push({ text: `💬 Chat Zalo (${cleanDigits})`, url: zaloChatUrl });
      }
      row2.push({ text: `🔐 Quản Trị Shop`, url: adminUrl });
      inlineKeyboard.push(row2);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chat_id: settings.telegramChatId.trim(),
          text: messageHtml,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        }),
      });
      clearTimeout(timeoutId);

      const resJson = await res.json();
      if (!resJson.ok) {
        console.error('[TELEGRAM BOT HTML ERROR, retrying plain text]:', resJson);
        // Fallback plain text if HTML tags ever fail
        const plainFallback = messageHtml.replace(/<[^>]*>?/gm, '');
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 3000);
        const retryRes = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: retryController.signal,
          body: JSON.stringify({
            chat_id: settings.telegramChatId.trim(),
            text: plainFallback,
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          }),
        });
        clearTimeout(retryTimeoutId);
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
