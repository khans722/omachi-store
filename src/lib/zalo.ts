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
  trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING',
  requestOrigin?: string
) {
  const isPaid = order.paymentStatus === 'PAID' || trigger === 'PAYMENT_SUCCESS';
  const isPrepaid = order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO';

  const cleanFullName = escapeHtml(order.customer.fullName);
  const cleanPhone = escapeHtml(order.customer.phone);
  const cleanAddress = escapeHtml(order.customer.address);
  const cleanNote = escapeHtml(order.customer.note || '');

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

  let title = '🌸 <b>OMACHI - CÓ ĐƠN HÀNG MỚI!</b> ✨';
  if (isPaid) {
    title = '💰 <b>OMACHI - ĐÃ XÁC NHẬN THANH TOÁN!</b> ✅';
  } else if (trigger === 'CONFIRMED') {
    title = '📦 <b>OMACHI - ĐÃ XÁC NHẬN ĐƠN HÀNG!</b> 🎀';
  }

  let methodText = '';
  let paymentStatusText = '';
  let shippingFeeText = '';
  let shopNoteText = '';

  if (isPaid) {
    methodText = order.paymentMethod === 'MOMO' ? '🟣 Ví MoMo' : order.paymentMethod === 'BANK' ? '💳 Chuyển khoản VietQR' : '💵 Thu tiền COD';
    paymentStatusText = '✅ <b>ĐÃ THANH TOÁN THÀNH CÔNG</b>';
    shippingFeeText = '🎁 <b>0đ</b> <i>(Đã áp dụng Miễn phí ship)</i>';
    shopNoteText = '✨ <b>TIỀN ĐÃ VỀ TÀI KHOẢN:</b> Shop an tâm đóng hàng và bàn giao bưu tá!';
  } else if (isPrepaid) {
    methodText = order.paymentMethod === 'MOMO' ? '🟣 Ví MoMo (Chờ khách quét QR)' : '💳 Chuyển khoản VietQR (Chờ khách quét QR)';
    paymentStatusText = '⏳ <b>CHƯA NHẬN TIỀN (Khách vừa tạo lệnh QR)</b>';
    shippingFeeText = '0đ <i>(Tạm tính theo ưu đãi Chuyển khoản - Điều kiện: Khách phải CK đủ)</i>';
    shopNoteText = `⚠️ <b>LƯU Ý CHO SHOP:</b> Vui lòng kiểm tra app Ngân hàng / MoMo xem đã nhận đủ <b>${formatVND(order.finalTotalAmount || order.totalAmount)}</b> chưa trước khi gửi hàng!\n<i>(Nếu khách KHÔNG chuyển khoản hoặc đổi sang COD, cước ship là 15.000đ)</i>`;
  } else {
    methodText = '💵 Thanh toán COD khi nhận hàng';
    paymentStatusText = '📦 <b>Đơn COD - Thu tiền mặt khi giao hàng</b>';
    shippingFeeText = order.shippingFee ? `<b>${formatVND(order.shippingFee)}</b>` : '15.000đ';
    shopNoteText = '💡 <b>ĐƠN COD:</b> Shipper SPX sẽ thu đủ tiền hàng + phí ship khi giao tận nơi.';
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

      // Nút 1-chạm xác nhận đã nhận tiền nếu đơn chưa thanh toán
      if (!isPaid && isPrepaid) {
        inlineKeyboard.push([
          {
            text: `✅ Xác Nhận ĐÃ NHẬN TIỀN (${formatVND(order.finalTotalAmount || order.totalAmount)})`,
            url: confirmPayUrl,
          },
        ]);
      }

      // Nút xem chi tiết đơn hàng
      inlineKeyboard.push([
        { text: `📦 Xem & Duyệt Đơn #${order.code}`, url: orderViewUrl },
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
