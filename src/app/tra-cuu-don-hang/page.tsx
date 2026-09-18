'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCustomer } from '@/context/CustomerContext';
import { Order, OrderStatus, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { 
  Search, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  ShoppingBag,
  Filter,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

function getStatusBadge(order: Order) {
  if (order.orderStatus === 'CANCELLED') {
    return {
      label: 'Đã hủy đơn',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      step: 0,
    };
  }

  // Đơn chuyển khoản (VietQR / MoMo) chưa thanh toán tiền: Luôn luôn là Chờ thanh toán (Bước 1)
  const isPrepaidUnpaid = (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && order.paymentStatus !== 'PAID';
  if (isPrepaidUnpaid) {
    return {
      label: 'Chờ thanh toán',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      step: 1,
    };
  }

  switch (order.orderStatus) {
    case 'PENDING_CONFIRM':
      return {
        label: 'Chờ xác nhận đơn',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-400',
        step: 1,
      };
    case 'PREPARING':
      return {
        label: 'Đang chuẩn bị & đóng gói',
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
        step: 2,
      };
    case 'SHIPPING':
      return {
        label: 'Đang vận chuyển giao hàng',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        step: 3,
      };
    case 'COMPLETED':
      return {
        label: 'Đã nhận hàng thành công',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        step: 4,
      };
    default:
      return {
        label: 'Đang xử lý',
        bg: 'bg-gray-50 text-gray-800 border-gray-200',
        dot: 'bg-gray-400',
        step: 1,
      };
  }
}

function OrderCard({
  order,
  zaloUrl,
  onOpenPaymentModal,
  onCancelOrder,
}: {
  order: Order;
  zaloUrl: string;
  onOpenPaymentModal?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getStatusBadge(order);
  const isPrepaidUnpaid = (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && order.paymentStatus !== 'PAID';
  const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cleanCode = (order.code || order.id || '').replace(/^#/, '').trim();
  const detailUrl = `/order/${encodeURIComponent(cleanCode)}`;
  const totalItemCount = (order.items || []).reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0);
  const finalTotal = order.finalTotalAmount || order.totalAmount;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm hover:shadow-md transition space-y-4">
      {/* Top Header: Order code, date, badges, and toggle button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100/70">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-base sm:text-lg text-rose-600">
              #{cleanCode}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.bg}`}>
              <span className={`w-2 h-2 rounded-full ${status.dot} ${order.orderStatus !== 'CANCELLED' ? 'animate-pulse' : ''}`} />
              <span>{status.label}</span>
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              order.paymentMethod === 'MOMO'
                ? 'bg-pink-50 text-[#A50064] border-pink-200'
                : order.paymentMethod === 'BANK'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}>
              {order.paymentMethod === 'MOMO'
                ? '🟣 Ví MoMo'
                : order.paymentMethod === 'BANK'
                ? '💳 VietQR'
                : '💵 COD'}
            </span>
            {(!isPrepaidUnpaid || order.orderStatus !== 'PENDING_CONFIRM') && (
              order.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>✓ Đã thanh toán</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Chưa thanh toán</span>
                </span>
              )
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Đặt lúc: {orderDate}</span>
          </p>
        </div>

        {/* Toggle Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 transition cursor-pointer self-start sm:self-auto"
        >
          <span>{isExpanded ? 'Thu gọn đơn' : 'Xem chi tiết'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Cancelled Alert Banner if cancelled */}
      {order.orderStatus === 'CANCELLED' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
          <span className="text-base">❌</span>
          <div>
            <strong className="font-bold">Đơn hàng này đã bị hủy ({order.cancelledBy === 'CUSTOMER' ? 'Bạn đã hủy' : 'Shop đã hủy'})</strong>
            {order.cancelReason && (
              <p className="text-[11px] text-rose-700 mt-0.5">Lý do: <em>{order.cancelReason}</em></p>
            )}
          </div>
        </div>
      )}

      {/* COLLAPSED VIEW (MẶC ĐỊNH THU GỌN) */}
      {!isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Tóm tắt sản phẩm (1-2 món đầu) */}
          <div className="space-y-1.5">
            {(order.items || []).slice(0, 2).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs text-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-rose-400 shrink-0">🎀</span>
                  <p className="truncate font-medium">
                    {item.productName || item.product?.name || 'Sản phẩm handmade'}
                    {(item.variantName || item.selectedVariant?.name) && (
                      <span className="text-gray-400 text-[11px]"> ({item.variantName || item.selectedVariant?.name})</span>
                    )}
                  </p>
                </div>
                <span className="text-gray-500 font-bold shrink-0">x{item.quantity}</span>
              </div>
            ))}
            {(order.items?.length || 0) > 2 && (
              <p className="text-[11px] text-gray-400 italic">
                + và {(order.items?.length || 0) - 2} sản phẩm khác...
              </p>
            )}
          </div>

          {/* Dòng tóm tắt tổng tiền & các nút hành động nhanh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-500">Tổng thanh toán:</span>
              <strong className="text-base sm:text-lg font-black text-rose-600">
                {formatVND(finalTotal)}
              </strong>
              <span className="text-xs text-gray-400">({totalItemCount} món)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
              {(order.orderStatus === 'PENDING_CONFIRM' || (order.paymentStatus !== 'PAID' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'SHIPPING' && order.orderStatus !== 'COMPLETED')) && onCancelOrder && (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-gray-200 text-xs font-bold transition cursor-pointer"
                >
                  Hủy đơn
                </button>
              )}

              {/* Nút Thanh toán ngay nếu chưa thanh toán */}
              {order.paymentStatus !== 'PAID' && (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && onOpenPaymentModal && order.orderStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => onOpenPaymentModal(order)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>💳 Thanh toán ngay</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-rose-600 border border-pink-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <a
                href={`${zaloUrl}?text=${encodeURIComponent(`Chào Omachi, mình muốn hỏi về đơn hàng #${cleanCode}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Zalo</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED VIEW (MỞ RỘNG ĐẦY ĐỦ KHI BẤM XEM CHI TIẾT) */}
      {isExpanded && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* Visual 4-Step Progress Tracker */}
          {order.orderStatus !== 'CANCELLED' && (
            <div className="py-2">
              <div className="relative">
                <div className="absolute top-4 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1 bg-gray-200 z-0">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{
                      width: status.step <= 1 ? '0%' : status.step === 2 ? '33.33%' : status.step === 3 ? '66.66%' : '100%',
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                  {/* Step 1 */}
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ring-4 ring-white ${
                      status.step >= 1 ? 'bg-rose-500 text-white shadow-xs' : 'bg-gray-100 text-gray-400'
                    }`}>
                      1
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold ${status.step >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>
                      Tiếp nhận đơn
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ring-4 ring-white ${
                      status.step >= 2 ? 'bg-rose-500 text-white shadow-xs' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold ${status.step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>
                      Chuẩn bị hàng
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ring-4 ring-white ${
                      status.step >= 3 ? 'bg-rose-500 text-white shadow-xs' : 'bg-gray-100 text-gray-400'
                    }`}>
                      3
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold ${status.step >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>
                      Đang giao hàng
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ring-4 ring-white ${
                      status.step >= 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-400'
                    }`}>
                      4
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold ${status.step >= 4 ? 'text-emerald-700 font-black' : 'text-gray-400'}`}>
                      Giao thành công
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Carrier / Tracking if shipping */}
          {order.trackingNumber && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>
                  Đơn vị vận chuyển: <strong>{order.carrierName || 'SPX Express'}</strong> • Mã vận đơn: <strong className="font-mono">{order.trackingNumber}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Products In Order */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500">Danh sách sản phẩm trong đơn ({order.items?.length || 0} loại):</p>
            <div className="divide-y divide-gray-100 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">
                      🎀
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {item.productName || item.product?.name || 'Sản phẩm handmade'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {item.variantName || item.selectedVariant?.name ? (
                          <span className="text-rose-600 font-semibold">{item.variantName || item.selectedVariant?.name} • </span>
                        ) : null}
                        Số lượng: <strong>x{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-800 shrink-0">
                    {formatVND(item.totalPrice || (item.appliedUnitPrice * item.quantity))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng chi tiết Tiền Hàng & Phí Ship Vận Chuyển */}
          {(() => {
            const itemsTotal = order.items?.reduce((s: number, i: any) => s + Number(i.totalPrice || (i.appliedUnitPrice * i.quantity) || 0), 0) || order.subtotal || 0;
            const shippingFee = Number(order.shippingFee || 0);
            const discount = Number(order.discount || 0);

            return (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-pink-50/30 border border-pink-100/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Tiền hàng ({order.items?.length || 0} sản phẩm):</span>
                  <span className="font-bold text-stone-800">{formatVND(itemsTotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Ưu đãi Combo / Giảm giá:</span>
                    <span>-{formatVND(discount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Phí vận chuyển SPX:</span>
                  </span>
                  {shippingFee > 0 ? (
                    <span className="font-bold text-rose-600">
                      +{formatVND(shippingFee)}
                    </span>
                  ) : (
                    <span className="font-bold text-xs text-emerald-600">
                      0đ (Miễn phí)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-pink-100 font-bold">
                  <span className="text-stone-800 text-xs sm:text-sm">Tổng thanh toán:</span>
                  <span className="text-base sm:text-lg font-black text-rose-600">
                    {formatVND(finalTotal)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Receiver Info & Address */}
          <div className="p-3.5 bg-pink-50/30 rounded-2xl border border-pink-100/60 text-xs space-y-1">
            <p className="text-stone-600">
              Người nhận: <strong className="text-stone-800">{order.customer?.fullName}</strong> ({order.customer?.phone})
            </p>
            <p className="text-stone-500 truncate max-w-sm sm:max-w-md">
              Địa chỉ: {order.customer?.address}
            </p>
            {order.customer?.note && (
              <p className="text-[11px] text-stone-400 italic mt-0.5">
                Ghi chú: &quot;{order.customer.note}&quot;
              </p>
            )}
          </div>

          {/* Expanded Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer self-start sm:self-auto"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Thu gọn lại</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
              {(order.orderStatus === 'PENDING_CONFIRM' || (order.paymentStatus !== 'PAID' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'SHIPPING' && order.orderStatus !== 'COMPLETED')) && onCancelOrder && (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order)}
                  className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-gray-200 text-xs font-bold transition cursor-pointer"
                >
                  Hủy đơn hàng
                </button>
              )}

              {/* Nút Thanh toán ngay nếu chưa thanh toán */}
              {order.paymentStatus !== 'PAID' && (order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO') && onOpenPaymentModal && order.orderStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => onOpenPaymentModal(order)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                >
                  <span>💳 Thanh toán ngay (Quét QR)</span>
                </button>
              )}

              <Link
                href={detailUrl}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    window.location.href = detailUrl;
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-rose-600 border border-pink-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>Xem trang riêng</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href={`${zaloUrl}?text=${encodeURIComponent(`Chào Omachi, mình muốn hỏi về đơn hàng #${cleanCode}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Bấm để chat nhanh Zalo về đơn này"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderLookupContent() {
  const { customer, openAuthModal } = useCustomer();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'my_orders' | 'lookup_other'>('my_orders');
  
  // Settings
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  // Selected Order for Payment Modal
  const [selectedPayOrder, setSelectedPayOrder] = useState<Order | null>(null);

  // My Orders State (Logged in)
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoadingMyOrders, setIsLoadingMyOrders] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('');

  // Other / Manual Lookup State
  const [manualQuery, setManualQuery] = useState('');
  const [manualOrders, setManualOrders] = useState<Order[]>([]);
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const [manualHasSearched, setManualHasSearched] = useState(false);
  const [manualErrorMsg, setManualErrorMsg] = useState('');

  // Customer Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [customerCancelReason, setCustomerCancelReason] = useState<string>('Muốn đổi sản phẩm khác / thêm bớt số lượng');
  const [customCustomerReason, setCustomCustomerReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCustomerConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = customCustomerReason.trim() ? customCustomerReason.trim() : customerCancelReason;
    setIsSubmittingCancel(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancellingOrder.id,
          orderStatus: 'CANCELLED',
          cancelReason: finalReason,
          cancelledBy: 'CUSTOMER',
          restock: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updateList = (prev: Order[]) =>
          prev.map((o) =>
            o.id === cancellingOrder.id || o.code === cancellingOrder.code
              ? { ...o, orderStatus: 'CANCELLED' as OrderStatus, cancelReason: finalReason, cancelledBy: 'CUSTOMER' as const }
              : o
          );
        setMyOrders(updateList);
        setManualOrders(updateList);

        // Update local storage
        try {
          const custCached = localStorage.getItem('omachi_customer_orders');
          if (custCached) {
            const parsed = JSON.parse(custCached);
            const updated = parsed.map((o: any) =>
              o.id === cancellingOrder.id || o.code === cancellingOrder.code
                ? { ...o, orderStatus: 'CANCELLED', cancelReason: finalReason, cancelledBy: 'CUSTOMER' }
                : o
            );
            localStorage.setItem('omachi_customer_orders', JSON.stringify(updated));
          }
        } catch (e) {}

        setCancellingOrder(null);
        showToast('Đã hủy đơn hàng thành công! Cảm ơn bạn đã thông báo.');
      } else {
        showToast('Không thể hủy đơn: ' + (data.message || 'Lỗi hệ thống'), true);
      }
    } catch (e: any) {
      showToast('Lỗi kết nối khi hủy đơn: ' + (e.message || e), true);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('omachi_shop_settings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }
    } catch (e) {}

    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          try {
            localStorage.setItem('omachi_shop_settings', JSON.stringify(res.data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Set default tab based on login status
  useEffect(() => {
    if (customer) {
      setActiveTab('my_orders');
    } else {
      setActiveTab('lookup_other');
    }
  }, [customer]);

  // Load My Orders automatically when customer is logged in
  useEffect(() => {
    if (!customer?.id) return;

    let isMounted = true;
    setIsLoadingMyOrders(true);

    const loadOrders = async () => {
      try {
        const cleanCustPhone = (customer.phone || '').replace(/[^0-9]/g, '');
        const res = await fetch(`/api/orders/lookup?customerId=${encodeURIComponent(customer.id)}`);
        const data = await res.json();
        
        let serverList: Order[] = (data.success && Array.isArray(data.data)) ? data.data : [];

        // Scan local storage for client-side fallback/merge
        let localList: Order[] = [];
        try {
          const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
          const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
          const allLocal: Order[] = [...custOrders, ...adminOrders];
          localList = allLocal.filter((o: any) => {
            const oCustId = o.customerId;
            const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
            return (oCustId && oCustId === customer.id) || (cleanCustPhone && oPhone === cleanCustPhone);
          });
        } catch (e) {}

        // Merge and deduplicate by code or id
        const orderMap = new Map<string, Order>();
        [...serverList, ...localList].forEach((o) => {
          const key = o.code || o.id;
          if (key && !orderMap.has(key)) {
            orderMap.set(key, o);
          }
        });

        const mergedOrders = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (isMounted) {
          setMyOrders(mergedOrders);
        }
      } catch (err) {
        console.error('Error loading my orders:', err);
      } finally {
        if (isMounted) {
          setIsLoadingMyOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [customer?.id, customer?.phone]);

  // Handle URL search params (e.g. ?code=OM-1234 or ?phone=0988...)
  useEffect(() => {
    const urlQuery = searchParams.get('code') || searchParams.get('phone') || searchParams.get('query');
    if (urlQuery && urlQuery.trim()) {
      setManualQuery(urlQuery.trim());
      setActiveTab('lookup_other');
      executeManualSearch(urlQuery.trim());
    }
  }, [searchParams]);

  // Execute manual search
  const executeManualSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setManualErrorMsg('Vui lòng nhập Số điện thoại hoặc Mã đơn hàng để tra cứu');
      return;
    }

    setManualErrorMsg('');
    setIsSearchingManual(true);
    setManualHasSearched(true);

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setManualOrders(data.data);
      } else {
        // Fallback local storage lookup
        const cleanQuery = q.toLowerCase().replace(/^#/, '').trim();
        const cleanDigits = q.replace(/[^0-9]/g, '');
        let localMatches: Order[] = [];
        try {
          const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
          const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
          const allLocal: Order[] = [...custOrders, ...adminOrders];
          const map = new Map<string, Order>();
          allLocal.forEach((o: any) => {
            const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
            const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
            const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
            const matches = (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) ||
                            oCode.includes(cleanQuery) ||
                            oId.includes(cleanQuery);
            if (matches) {
              const key = o.id || o.code;
              if (key && !map.has(key)) map.set(key, o);
            }
          });
          localMatches = Array.from(map.values());
        } catch (e) {}

        if (localMatches.length > 0) {
          setManualOrders(localMatches);
          setManualErrorMsg('');
        } else {
          setManualOrders(data.data || []);
          setManualErrorMsg(data.error || 'Không tìm thấy đơn hàng nào khớp với thông tin này');
        }
      }
    } catch (err: any) {
      // Local storage fallback on network failure
      const cleanQuery = q.toLowerCase().replace(/^#/, '').trim();
      const cleanDigits = q.replace(/[^0-9]/g, '');
      let localMatches: Order[] = [];
      try {
        const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
        const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
        const allLocal: Order[] = [...custOrders, ...adminOrders];
        const map = new Map<string, Order>();
        allLocal.forEach((o: any) => {
          const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
          const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
          const matches = (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) ||
                          oCode.includes(cleanQuery) ||
                          oId.includes(cleanQuery);
          if (matches) {
            const key = o.id || o.code;
            if (key && !map.has(key)) map.set(key, o);
          }
        });
        localMatches = Array.from(map.values());
      } catch (e) {}

      if (localMatches.length > 0) {
        setManualOrders(localMatches);
        setManualErrorMsg('');
      } else {
        setManualErrorMsg('Lỗi kết nối máy chủ khi tra cứu: ' + (err.message || err));
        setManualOrders([]);
      }
    } finally {
      setIsSearchingManual(false);
    }
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeManualSearch(manualQuery);
  };

  // Filtered My Orders
  const filteredMyOrders = useMemo(() => {
    if (!filterKeyword.trim()) return myOrders;
    const kw = filterKeyword.toLowerCase().trim().replace(/^#/, '');
    const cleanDigits = filterKeyword.replace(/[^0-9]/g, '');

    return myOrders.filter((order) => {
      const code = (order.code || '').toLowerCase();
      const receiver = (order.customer?.fullName || '').toLowerCase();
      const phone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const hasProduct = (order.items || []).some((it: any) =>
        (it.productName || it.product?.name || '').toLowerCase().includes(kw)
      );

      return (
        code.includes(kw) ||
        receiver.includes(kw) ||
        (cleanDigits.length >= 4 && phone.includes(cleanDigits)) ||
        hasProduct
      );
    });
  }, [myOrders, filterKeyword]);

  // Order count stats
  const activeOrdersCount = useMemo(() => {
    return myOrders.filter((o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED').length;
  }, [myOrders]);

  const completedOrdersCount = useMemo(() => {
    return myOrders.filter((o) => o.orderStatus === 'COMPLETED').length;
  }, [myOrders]);

  const zaloHotline = settings?.zaloPhone || settings?.hotline || '';
  const zaloUrl = settings?.zaloOfficialUrl || (zaloHotline ? `https://zalo.me/${zaloHotline.replace(/[^0-9]/g, '')}` : 'https://zalo.me');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in relative">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[99999] max-w-sm w-full px-4 sm:px-0">
          <div className={`p-3.5 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 text-white ${
            toastMessage.isError ? 'bg-rose-600' : 'bg-emerald-600'
          }`}>
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/70 hover:text-white cursor-pointer font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-xs font-bold text-rose-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Theo Dõi Hành Trình Đơn Hàng Omachi</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">
          {customer ? 'Quản Lý Đơn Hàng Của Tôi 📦' : 'Tra Cứu Đơn Hàng Siêu Tốc 🔍'}
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          {customer
            ? 'Toàn bộ đơn hàng bạn đã đặt được lưu giữ tại đây. Bạn có thể theo dõi tiến độ đóng gói, vận chuyển SPX và chat Zalo bất cứ lúc nào!'
            : 'Dù bạn đặt hàng dạng Khách hay Thành viên, chỉ cần nhập Số Điện Thoại hoặc Mã Đơn Hàng là kiểm tra được ngay!'}
        </p>

        {/* Member Status Badge or Login Prompt */}
        {!customer ? (
          <div className="pt-1.5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-pink-50/70 border border-pink-200">
            <User className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-gray-600">Đã có tài khoản thành viên?</span>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              Đăng nhập để xem tự động
            </button>
          </div>
        ) : (
          <div className="pt-1.5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Tài khoản: {customer.fullName} • {customer.phone}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation (For logged-in users) */}
      {customer && (
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('my_orders')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'my_orders'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Đơn Hàng Của Tôi</span>
              {myOrders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold">
                  {myOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lookup_other')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'lookup_other'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Đơn Khác</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: MY ORDERS (TỰ ĐỘNG CHO TÀI KHOẢN ĐÃ ĐĂNG NHẬP) */}
      {customer && activeTab === 'my_orders' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Stats Banner */}
          {myOrders.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-pink-100 shadow-2xs text-center">
                <span className="text-[11px] font-bold text-gray-400 block">TỔNG ĐƠN HÀNG</span>
                <span className="text-lg sm:text-xl font-black text-gray-800">{myOrders.length}</span>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-2xs text-center">
                <span className="text-[11px] font-bold text-amber-600 block">ĐANG XỬ LÝ / GIAO</span>
                <span className="text-lg sm:text-xl font-black text-amber-600">{activeOrdersCount}</span>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-2xs text-center">
                <span className="text-[11px] font-bold text-emerald-600 block">HOÀN THÀNH</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600">{completedOrdersCount}</span>
              </div>
            </div>
          )}

          {/* Quick Filter Search Bar */}
          {myOrders.length > 1 && (
            <div className="relative">
              <input
                type="text"
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                placeholder="Lọc nhanh theo Mã đơn (VD: 1234), tên người nhận hoặc tên sản phẩm..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-2xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {filterKeyword && (
                <button
                  type="button"
                  onClick={() => setFilterKeyword('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoadingMyOrders && (
            <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 shadow-xs space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Đang đồng bộ đơn hàng của bạn...</p>
            </div>
          )}

          {/* Empty State: Never made any order yet */}
          {!isLoadingMyOrders && myOrders.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-pink-100 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
                🛍️
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-gray-800 text-base sm:text-lg">
                  Tài khoản của bạn chưa có đơn hàng nào
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Khi bạn tiến hành đặt hàng trên website, toàn bộ lịch sử đơn hàng và tiến trình vận chuyển sẽ tự động xuất hiện tại đây mà không cần tra cứu thủ công!
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/san-pham"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200 transition active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Khám Phá Sản Phẩm Ngay</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab('lookup_other')}
                  className="px-5 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Tra cứu đơn mua bằng số điện thoại khác</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter returned 0 results */}
          {!isLoadingMyOrders && myOrders.length > 0 && filteredMyOrders.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-xs space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-bold text-gray-800 text-sm">Không tìm thấy đơn hàng phù hợp với từ khóa</h4>
              <p className="text-xs text-gray-500">
                Thử tìm lại với mã đơn hàng khác hoặc xóa bộ lọc để xem toàn bộ danh sách.
              </p>
              <button
                type="button"
                onClick={() => setFilterKeyword('')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}

          {/* Orders List */}
          {!isLoadingMyOrders && filteredMyOrders.length > 0 && (
            <div className="space-y-4">
              {filteredMyOrders.map((order) => (
                <OrderCard
                  key={order.id || order.code}
                  order={order}
                  zaloUrl={zaloUrl}
                  onOpenPaymentModal={setSelectedPayOrder}
                  onCancelOrder={setCancellingOrder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL LOOKUP (KHÁCH VÃNG LAI HOẶC TRA CỨU ĐƠN KHÁC) */}
      {(!customer || activeTab === 'lookup_other') && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Manual Search Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-pink-100 shadow-xl max-w-2xl mx-auto space-y-3">
            <h2 className="text-sm sm:text-base font-black text-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-500" />
              <span>Nhập thông tin đơn hàng cần tra cứu</span>
            </h2>

            <form onSubmit={handleManualSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Nhập Số điện thoại (VD: 0988...) hoặc Mã đơn (VD: OM-1234)"
                  className="w-full pl-11 pr-4 py-3.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition"
                />
                <Search className="w-5 h-5 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="submit"
                disabled={isSearchingManual}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200 transition transform active:scale-98 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSearchingManual ? (
                  <span>Đang tra cứu...</span>
                ) : (
                  <>
                    <span>Tra Cứu Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {manualErrorMsg && (
              <p className="text-xs font-bold text-rose-600 mt-2 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ {manualErrorMsg}
              </p>
            )}
          </div>

          {/* Results for Manual Search */}
          {manualHasSearched && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-rose-500" />
                  <span>Kết Quả Tra Cứu ({manualOrders.length} đơn hàng)</span>
                </h2>
                {manualOrders.length > 0 && (
                  <span className="text-xs text-gray-500">Mới nhất ở trên</span>
                )}
              </div>

              {manualOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-pink-100 shadow-xs space-y-3">
                  <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center text-2xl mx-auto">
                    📦
                  </div>
                  <h3 className="font-bold text-gray-800 text-base">Chưa tìm thấy đơn hàng nào!</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Vui lòng kiểm tra lại đúng Số điện thoại người nhận hoặc Mã đơn hàng (VD: OM-1234). Bạn cũng có thể liên hệ trực tiếp Zalo shop để được kiểm tra thủ công nhé!
                  </p>
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn Zalo Hỗ Trợ Nhanh</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {manualOrders.map((order) => (
                    <OrderCard
                      key={order.id || order.code}
                      order={order}
                      zaloUrl={zaloUrl}
                      onOpenPaymentModal={setSelectedPayOrder}
                      onCancelOrder={setCancellingOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Info Box */}
      <div className="bg-pink-50/60 rounded-3xl p-6 border border-pink-100 text-xs text-gray-600 space-y-2">
        <h4 className="font-black text-gray-800 flex items-center gap-1.5 text-sm">
          <span>🌸 Omachi Handmade Store Chăm Sóc Khách Hàng</span>
        </h4>
        <p>
          Mọi đơn hàng sau khi đặt trên website đều được nhân viên Omachi liên hệ xác nhận và gửi ảnh mẫu hoàn thiện qua Zalo trước khi gửi bưu tá. Nếu bạn cần đổi mẫu hoặc giao gấp, vui lòng gọi Hotline: <strong className="text-rose-600">{settings?.hotline || settings?.zaloPhone || ''}</strong>.
        </p>
      </div>

      {/* Payment Modal for Re-paying via VietQR or MoMo */}
      <PaymentModal
        order={selectedPayOrder}
        settings={settings}
        isOpen={Boolean(selectedPayOrder)}
        onClose={() => setSelectedPayOrder(null)}
        onPaymentConfirmed={() => {
          setSelectedPayOrder(null);
        }}
      />

      {/* MODAL: CUSTOMER CANCEL ORDER */}
      {cancellingOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingCancel) setCancellingOrder(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-3xl border border-pink-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
                  ❌
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800">
                    Hủy Đơn Hàng #{cancellingOrder.code}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Đơn hàng chỉ có thể hủy khi shop chưa đóng gói.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">⚠️ Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
              <p className="text-[11px] text-amber-700">
                Nếu bạn chỉ muốn đổi mẫu charm hoặc sửa địa chỉ, bạn có thể nhắn Zalo cho shop thay vì hủy đơn nhé!
              </p>
            </div>

            {/* Reasons Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 block">
                Vui lòng cho shop biết lý do bạn muốn hủy đơn:
              </label>

              <div className="space-y-1.5">
                {[
                  'Muốn đổi sản phẩm khác / thêm bớt số lượng',
                  'Muốn thay đổi địa chỉ nhận hàng / số điện thoại',
                  'Đổi ý, không còn nhu cầu mua nữa',
                  'Đặt nhầm đơn / Trùng lặp đơn hàng',
                  'Lý do khác',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      customerCancelReason === reason
                        ? 'bg-rose-50/80 border-rose-300 text-rose-900 font-bold'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="customerCancelReason"
                      value={reason}
                      checked={customerCancelReason === reason}
                      onChange={() => setCustomerCancelReason(reason)}
                      className="text-rose-600 focus:ring-rose-400"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  value={customCustomerReason}
                  onChange={(e) => setCustomCustomerReason(e.target.value)}
                  placeholder="Ghi chú thêm lý do (tùy chọn)..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
              >
                Giữ đơn lại
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCustomerConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingCancel ? 'Đang hủy đơn...' : 'Xác Nhận Hủy Đơn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-400">Đang tải trang đơn hàng...</p>
      </div>
    }>
      <OrderLookupContent />
    </Suspense>
  );
}
