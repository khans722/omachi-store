'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { Order, ShopSettings } from '@/types';
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
  User,
  ShoppingBag
} from 'lucide-react';

export default function OrderLookupPage() {
  const { customer, openAuthModal } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-search if customer is logged in
  useEffect(() => {
    if (customer?.phone) {
      setSearchQuery(customer.phone);
      performSearch(customer.phone);
    }
  }, [customer]);

  const performSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setErrorMsg('Vui lòng nhập Số điện thoại hoặc Mã đơn hàng để tra cứu');
      return;
    }

    setErrorMsg('');
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      } else {
        setOrders([]);
        setErrorMsg(data.error || 'Không tìm thấy đơn hàng nào khớp với thông tin này');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ khi tra cứu: ' + (err.message || err));
      setOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      case 'CANCELLED':
        return {
          label: 'Đã hủy đơn',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          step: 0,
        };
      default:
        return {
          label: 'Đang xử lý',
          bg: 'bg-gray-50 text-gray-800 border-gray-200',
          dot: 'bg-gray-400',
          step: 1,
        };
    }
  };

  const zaloHotline = settings?.zaloPhone || '0375408256';
  const zaloUrl = settings?.zaloOfficialUrl || `https://zalo.me/${zaloHotline}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-xs font-bold text-rose-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Theo Dõi Hành Trình Đơn Hàng Omachi</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">
          Tra Cứu Đơn Hàng Siêu Tốc 🔍
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          Dù bạn đặt hàng dạng <strong>Khách (Guest)</strong> hay <strong>Thành viên</strong>, chỉ cần nhập <strong>Số Điện Thoại</strong> hoặc <strong>Mã Đơn Hàng</strong> là kiểm tra được ngay!
        </p>

        {/* Member login status prompt */}
        {!customer ? (
          <div className="pt-1">
            <span className="text-xs text-gray-500">Đã có tài khoản thành viên? </span>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Đăng nhập để xem tự động
            </button>
          </div>
        ) : (
          <div className="pt-1 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đang tra cứu theo tài khoản: {customer.fullName} ({customer.phone})</span>
          </div>
        )}
      </div>

      {/* Search Bar Form */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-xl max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập Số điện thoại (VD: 0988...) hoặc Mã đơn (VD: OM-1234)"
              className="w-full pl-11 pr-4 py-3.5 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition"
            />
            <Search className="w-5 h-5 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200 transition transform active:scale-98 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? (
              <span>Đang tra cứu...</span>
            ) : (
              <>
                <span>Tra Cứu Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs font-bold text-rose-600 mt-3 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            ⚠️ {errorMsg}
          </p>
        )}
      </div>

      {/* Orders List Results */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-500" />
              <span>Kết Quả Tìm Thấy ({orders.length} đơn hàng)</span>
            </h2>
            {orders.length > 0 && (
              <span className="text-xs text-gray-500">Mới nhất ở trên</span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-pink-100 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center text-2xl mx-auto">
                📦
              </div>
              <h3 className="font-bold text-gray-800 text-base">Chưa tìm thấy đơn hàng nào!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Vui lòng kiểm tra lại đúng Số điện thoại đã đặt hàng hoặc liên hệ trực tiếp Zalo shop để được kiểm tra thủ công nhé!
              </p>
              <a
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Hỗ Trợ Nhanh</span>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = getStatusBadge(order.orderStatus);
                const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-md hover:shadow-lg transition space-y-5"
                  >
                    {/* Top Row: Order code, date, badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100/70">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-base sm:text-lg text-rose-600">
                            #{order.code}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                            <span>{status.label}</span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Đặt lúc: {orderDate}</span>
                        </p>
                      </div>

                      {/* Detail Link */}
                      <Link
                        href={`/order/${order.code || order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline self-start sm:self-auto"
                      >
                        <span>Xem trang chi tiết</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Visual 4-Step Progress Tracker */}
                    {order.orderStatus !== 'CANCELLED' && (
                      <div className="py-2">
                        <div className="relative">
                          {/* Horizontal connecting line */}
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
                            Đơn vị vận chuyển: <strong>{order.carrierName || 'Viettel Post / GHTK'}</strong> • Mã vận đơn: <strong className="font-mono">{order.trackingNumber}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Products In Order */}
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-gray-500">Sản phẩm trong đơn:</p>
                      <div className="divide-y divide-gray-100">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-pink-100 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">
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
                              <span>Phí vận chuyển ({order.carrierName || 'SPX Express'}):</span>
                            </span>
                            {shippingFee > 0 ? (
                              <span className="font-black text-rose-600">
                                +{formatVND(shippingFee)}
                              </span>
                            ) : order.shippingFee === 0 ? (
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Miễn phí (Freeship 0đ)
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                                Báo sau khi cân thực tế
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-pink-100 font-bold">
                            <div>
                              <span className="text-stone-800 text-xs sm:text-sm">Tổng thanh toán:</span>
                              <span className="text-[10px] sm:text-xs text-stone-400 block font-normal">
                                {order.paymentMethod === 'COD' ? '(Thu tiền mặt khi nhận hàng COD)' : '(Chốt đơn qua Zalo)'}
                              </span>
                            </div>
                            <span className="text-base sm:text-lg font-black text-rose-600">
                              {formatVND(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Bottom Summary & Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-stone-600">
                          Người nhận: <strong className="text-stone-800">{order.customer?.fullName}</strong> ({order.customer?.phone})
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-sm sm:max-w-md">
                          Địa chỉ: {order.customer?.address}
                        </p>
                        {order.customer?.note && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5">
                            Ghi chú: &quot;{order.customer.note}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <Link
                          href={`/order/${order.code || order.id}`}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-rose-600 border border-pink-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        <a
                          href={`${zaloUrl}?text=${encodeURIComponent(`Chào Omachi, mình muốn hỏi về đơn hàng #${order.code}`)}`}
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
                );
              })}
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
          Mọi đơn hàng sau khi đặt trên website đều được nhân viên Omachi liên hệ xác nhận và gửi ảnh mẫu hoàn thiện qua Zalo trước khi gửi bưu tá. Nếu bạn cần đổi mẫu hoặc gấp, vui lòng gọi Hotline: <strong className="text-rose-600">{settings?.hotline || '0375.408.256'}</strong>.
        </p>
      </div>

    </div>
  );
}
