import { Order } from '@/types';
import { db } from '@/lib/db';
import { sendOrderNotification } from '@/lib/zalo';

export interface SepayTransaction {
  id: string | number;
  bank_brand_name?: string;
  account_number?: string;
  transaction_date?: string;
  amount_in?: string | number;
  amount_out?: string | number;
  accumulated?: string | number;
  transaction_content?: string;
  reference_number?: string;
  code?: string;
  sub_account?: string;
  [key: string]: any;
}

/**
 * Chủ động quét danh sách giao dịch từ SePay User API
 * Giúp website tự động khớp tiền kể cả khi Webhook bị delay hoặc chưa cấu hình kịp.
 */
export async function checkAndSyncSepayForOrder(
  order: Order,
  customApiKey?: string
): Promise<{ isPaid: boolean; order?: Order; matchedTransaction?: SepayTransaction; message?: string }> {
  try {
    if (!order || order.paymentStatus === 'PAID') {
      return { isPaid: true, order };
    }

    // 1. Lấy API Token từ setting hoặc biến môi trường
    let apiKey = (customApiKey || '').trim();
    if (!apiKey) {
      const settings = await db.settings.get();
      apiKey = ((settings as any).sepayApiKey || process.env.SEPAY_API_KEY || '').trim();
    }

    if (!apiKey) {
      return { isPaid: false, message: 'Chưa cấu hình SePay API Token' };
    }

    // 2. Gọi SePay User API v2 lấy danh sách giao dịch mới nhất
    let response = await fetch('https://userapi.sepay.vn/v2/transactions?limit=30', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Fallback v1 nếu cần
      response = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=30', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      console.warn('[SEPAY API ERROR]: HTTP', response.status, response.statusText);
      return { isPaid: false, message: `Lỗi kết nối SePay: HTTP ${response.status}` };
    }

    const resData = await response.json();
    const transactions: SepayTransaction[] = resData?.data || resData?.transactions || [];

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { isPaid: false, message: 'Chưa có giao dịch mới trên SePay' };
    }

    const orderCodeClean = (order.code || '').replace(/^#/, '').toUpperCase().trim();
    const orderCodeNoDash = orderCodeClean.replace(/[^0-9A-Z]/g, '');
    const targetDigits = orderCodeClean.replace(/[^0-9]/g, '');
    const expectedAmount = Number(order.finalTotalAmount || order.totalAmount || 0);

    // 3. Tìm giao dịch khớp với mã đơn hàng và số tiền
    const matchedTx = transactions.find((tx) => {
      const amountIn = Number(tx.amount_in || tx.amount || 0);
      if (amountIn < expectedAmount) return false;

      const content = (tx.transaction_content || tx.description || tx.content || '').toUpperCase();

      // Khớp theo mã đầy đủ (VD: OM-1095 hoặc SEVQR DH OM1095)
      if (orderCodeClean && content.includes(orderCodeClean)) return true;
      if (orderCodeNoDash && content.includes(orderCodeNoDash)) return true;

      // Khớp theo các số cuối (VD: 1095 trong SEVQR DH OM1095 hoặc SEVQR 1095)
      if (targetDigits.length >= 4) {
        if (
          content.includes(`OM-${targetDigits}`) ||
          content.includes(`OM${targetDigits}`) ||
          content.includes(`OM ${targetDigits}`) ||
          content.includes(`DH ${targetDigits}`)
        ) {
          return true;
        }
        // Kiểm tra xem chuỗi số có xuất hiện riêng lẻ không
        const numRegex = new RegExp(`(^|[^0-9])${targetDigits}([^0-9]|$)`);
        if (numRegex.test(content)) return true;
      }

      return false;
    });

    if (!matchedTx) {
      return { isPaid: false, message: 'Chưa tìm thấy giao dịch ngân hàng khớp với nội dung chuyển khoản' };
    }

    // 4. Tìm thấy giao dịch hợp lệ -> Cập nhật đơn hàng sang PAID ngay lập tức!
    console.log(`[SEPAY ACTIVE MATCH]: Khớp giao dịch ${matchedTx.id} cho đơn #${order.code}!`);
    const newOrderStatus = order.orderStatus === 'PENDING_CONFIRM' ? 'PREPARING' : order.orderStatus;
    const updated = await db.orders.updateStatus(
      order.id,
      newOrderStatus,
      'PAID',
      order.carrierName,
      order.trackingNumber,
      order.shippingFee,
      order as any
    );

    if (updated) {
      // Bắn thông báo Telegram cho chủ shop
      const settings = await db.settings.get();
      sendOrderNotification(updated, settings, 'PAYMENT_SUCCESS').catch((err) => {
        console.error('[SEPAY ACTIVE NOTIFICATION ERROR]:', err);
      });

      return {
        isPaid: true,
        order: updated,
        matchedTransaction: matchedTx,
        message: 'Đã tự động xác nhận thanh toán thành công qua SePay!',
      };
    }

    return { isPaid: false, message: 'Lỗi cập nhật trạng thái đơn hàng' };
  } catch (error: any) {
    console.error('[CHECK SEPAY ERROR]:', error);
    return { isPaid: false, message: error?.message || 'Lỗi khi đối soát SePay' };
  }
}
