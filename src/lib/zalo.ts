import { Order, ShopSettings } from '@/types';
import { formatVND } from './utils';

/**
 * Send notification to Zalo / Telegram webhook when an order is created or status changes
 */
export async function sendOrderNotification(
  order: Order,
  settings: ShopSettings,
  trigger: 'NEW_ORDER' | 'PAYMENT_SUCCESS' | 'CONFIRMED' | 'SHIPPING'
) {
  const itemsText = (order.items || [])
    .map((item: any, idx: number) => {
      const name = item.productName || item.product?.name || 'Mẫu Charm';
      const variant = item.variantName || item.selectedVariant?.name || '';
      const qty = item.quantity || 1;
      const total = item.totalPrice || 0;
      const pkg = item.selectedPackage?.name || '';
      const details = [variant, pkg ? `Quy cách: ${pkg}` : ''].filter(Boolean).join(' • ');
      return `   ${idx + 1}. ${name} ${details ? `(${details})` : ''} x${qty} gói = ${formatVND(total)}`;
    })
    .join('\n');

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (settings as any).websiteUrl || 'http://localhost:3000').replace(/\/$/, '');
  const orderViewUrl = `${baseUrl}/order/${order.code || order.id}`;
  const adminUrl = `${baseUrl}/admin`;

  let title = '🌸 OMACHI - CÓ ĐƠN HÀNG MỚI! ✨';
  if (trigger === 'PAYMENT_SUCCESS') {
    title = '💰 OMACHI - ĐÃ XÁC NHẬN THANH TOÁN! ✅';
  } else if (trigger === 'CONFIRMED') {
    title = '📦 OMACHI - ĐÃ XÁC NHẬN ĐƠN HÀNG! 🎀';
  }

  const messageText = `
${title}
----------------------------------------
🧾 Mã đơn: #${order.code}
👤 Khách hàng: ${order.customer.fullName}
📞 Số điện thoại: ${order.customer.phone}
📍 Địa chỉ: ${order.customer.address}
${order.customer.note ? `📝 Ghi chú: ${order.customer.note}\n` : ''}
🛒 Danh sách sản phẩm:
${itemsText}

💰 Tiền hàng: ${formatVND(order.subtotal || (order as any).subtotalAmount || (order.totalAmount - (order.shippingFee || 0)))}
🚚 Phí ship: ${order.shippingFee ? formatVND(order.shippingFee) : '💬 Shop cân thực tế & báo khách qua Zalo'}
💵 TỔNG TIỀN HÀNG: ${formatVND(order.totalAmount)} ${order.shippingFee ? '' : '(Chưa gồm ship)'}
💳 Phương thức: ${order.paymentMethod === 'ZALO_CONFIRM' ? 'Thanh toán COD khi nhận hàng' : 'Thanh toán khi nhận (COD)'}
📌 Trạng thái: ${order.shippingFee ? 'ĐÃ CÓ PHÍ SHIP' : 'CHỜ SHOP CÂN HÀNG & BÁO SHIP'}

⏰ Thời gian: ${new Date(order.createdAt).toLocaleString('vi-VN')}
----------------------------------------
👉 Xem đơn hàng: ${orderViewUrl}
👉 Trang quản trị shop: ${adminUrl}
`;

  console.log('[NOTIFICATION LOG]:\n', messageText);

  let telegramResult: { success: boolean; error?: string } | null = null;

  // GỬI THÔNG BÁO VỀ TELEGRAM NẾU ĐÃ CẤU HÌNH TOKEN & CHAT ID
  if (settings.telegramBotToken && settings.telegramChatId && settings.enableTelegramNotify !== false) {
    try {
      const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const zaloChatUrl = `https://zalo.me/${cleanPhone}`;

      // Tạo các nút bấm tương tác trực tiếp dưới tin nhắn Telegram
      const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [
        [
          { text: `📦 Xem & Duyệt Đơn #${order.code}`, url: orderViewUrl }
        ]
      ];

      if (cleanPhone) {
        inlineKeyboard.push([
          { text: `💬 Mở Chat Zalo Với Khách (${cleanPhone})`, url: zaloChatUrl }
        ]);
      }

      const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId.trim(),
          text: messageText,
          reply_markup: {
            inline_keyboard: inlineKeyboard
          },
        }),
      });

      const resJson = await res.json();
      if (!resJson.ok) {
        console.error('[TELEGRAM BOT ERROR]:', resJson);
        telegramResult = {
          success: false,
          error: resJson.description || 'Lỗi gửi tin Telegram',
        };
      } else {
        console.log('[TELEGRAM BOT SUCCESS]: Message sent to chat', settings.telegramChatId);
        telegramResult = { success: true };
      }
    } catch (tgErr) {
      console.error('[TELEGRAM BOT FAILED]:', tgErr);
      telegramResult = { success: false, error: (tgErr && tgErr.message) || String(tgErr) };
    }
  }

  return { success: true, messageText, telegram: telegramResult };
}
