'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order, OrderStatus, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { CheckCircle2, Clock, PackageCheck, Truck, Sparkles, ArrowLeft, Phone, Check, MessageCircle, Copy, Download } from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderCode = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(() => {});
    }
  };

  const downloadQrImage = async (url: string, filename: string) => {
    setIsDownloadingQr(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    } finally {
      setIsDownloadingQr(false);
    }
  };

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

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderCode}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          // Check local cache if serverless container hasn't synced yet
          try {
            const cleanCode = (orderCode || '').toLowerCase().replace(/^#/, '').trim();
            const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
            const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
            const allLocal = [...custOrders, ...adminOrders];
            const found = allLocal.find((o: any) => 
              (o.code && o.code.toLowerCase().replace(/^#/, '').trim() === cleanCode) ||
              (o.id && o.id.toLowerCase().replace(/^#/, '').trim() === cleanCode)
            );
            if (found) {
              setOrder(found);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error(err);
        try {
          const cleanCode = (orderCode || '').toLowerCase().replace(/^#/, '').trim();
          const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
          const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
          const allLocal = [...custOrders, ...adminOrders];
          const found = allLocal.find((o: any) => 
            (o.code && o.code.toLowerCase().replace(/^#/, '').trim() === cleanCode) ||
            (o.id && o.id.toLowerCase().replace(/^#/, '').trim() === cleanCode)
          );
          if (found) setOrder(found);
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    }
    if (orderCode) {
      fetchOrder();
    }
  }, [orderCode]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">Đang tra cứu thông tin đơn hàng #{orderCode}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-gray-500">Mã đơn #{orderCode} không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-xs shadow-md">
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  // Steps indicator logic
  const steps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'PENDING_CONFIRM', label: 'Đặt hàng thành công', desc: 'Đã nhận thông tin', icon: Clock },
    { key: 'PREPARING', label: 'Shop đang chuẩn bị hàng', desc: 'Đang kiểm tra & đóng gói hàng', icon: Sparkles },
    { key: 'SHIPPING', label: 'Đang giao hàng', desc: 'Đã bàn giao shipper', icon: Truck },
    { key: 'COMPLETED', label: 'Giao thành công', desc: 'Khách đã nhận hàng xinh', icon: PackageCheck },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_CONFIRM':
        return 0;
      case 'PREPARING':
        return 1;
      case 'SHIPPING':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-50 rounded-3xl p-6 border border-pink-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎀</span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800">
              Đơn Hàng #{order.code}
            </h1>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus === 'PAID' ? '✓ ĐÃ THANH TOÁN' : '⏳ CHỜ THANH TOÁN'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-white text-pink-600 hover:bg-pink-50 border border-pink-200 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tiếp tục mua hàng</span>
        </Link>
      </div>

      {/* Top Alert Banner if Unpaid */}
      {order.paymentStatus !== 'PAID' && order.paymentMethod === 'BANK' && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">⚡</span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-900">
                Đơn hàng đang chờ hoàn tất thanh toán qua Chuyển khoản VietQR
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Vui lòng quét mã QR bên dưới hoặc chuyển khoản đúng số tiền để shop chuẩn bị hàng nhanh nhất nhé!
              </p>
            </div>
          </div>
          <a
            href="#payment-box"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition shadow-xs"
          >
            Quét mã thanh toán ngay ↓
          </a>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-xs">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6">
          Tiến Độ Đơn Hàng
        </h3>

        <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
          {/* Horizontal line for desktop */}
          <div className="hidden sm:block absolute top-5 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1 bg-gray-200 z-0">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500 rounded-full"
              style={{
                width: currentStep <= 0 ? '0%' : currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%',
              }}
            />
          </div>

          {/* Vertical line for mobile */}
          <div className="sm:hidden absolute top-5 bottom-5 left-5 -translate-x-1/2 w-1 bg-gray-200 z-0">
            <div
              className="w-full bg-gradient-to-b from-pink-500 to-rose-400 transition-all duration-500 rounded-full"
              style={{
                height: currentStep <= 0 ? '0%' : currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%',
              }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex-1 flex sm:flex-col items-center gap-3 sm:text-center relative">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm z-10 transition-all ring-4 ring-white ${
                    isCompleted
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  } ${isCurrent ? 'ring-4 ring-pink-200 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h4 className={`text-xs font-black ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Order details & QR (if unpaid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Items list */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <span>🌸 Chi Tiết Đơn Hàng</span>
          </h3>

          <div className="divide-y divide-pink-50 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.images[0] || '/images/charm_feed_1.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-xl border border-pink-100 flex-shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{item.product.name}</p>
                    <p className="text-[10px] text-pink-600">
                      {item.selectedVariant?.name || ''} x{item.quantity} {item.appliedTier ? `[${item.appliedTier.label}]` : ''}
                    </p>
                    {item.customNote && (
                      <p className="text-[10px] text-gray-400 italic">Custom: {item.customNote}</p>
                    )}
                  </div>
                </div>
                <span className="font-extrabold text-gray-800">{formatVND(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {(() => {
            const itemsTotal = order.subtotal || (order as any).itemsTotalAmount || order.items?.reduce((s, i) => s + (i.totalPrice || 0), 0) || 0;
            const shippingFee = Number(order.shippingFee || 0);

            return (
              <div className="pt-4 border-t border-pink-100 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tạm tính (Tiền hàng):</span>
                  <span className="font-semibold text-gray-800">{formatVND(itemsTotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Tiết kiệm giá Combo:</span>
                    <span>-{formatVND(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500" />
                    <span>Phí vận chuyển:</span>
                  </span>
                  <span className="font-bold text-gray-800">
                    {shippingFee > 0 ? (
                      <span className="text-rose-600 font-bold">+{formatVND(shippingFee)}</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 line-through text-[11px]">15.000đ</span>
                        <strong className="text-emerald-600 font-bold text-xs">0đ</strong>
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-pink-100 font-black text-base text-pink-600">
                  <div>
                    <span>Tổng thanh toán:</span>
                    {shippingFee === 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        (Đã miễn phí vận chuyển 0đ)
                      </span>
                    )}
                  </div>
                  <span>{formatVND(order.totalAmount)}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right: Customer & Payment info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              👤 Thông Tin Khách Hàng
            </h3>
            <p><strong>Người nhận:</strong> {order.customer.fullName}</p>
            <p><strong>Số điện thoại:</strong> {order.customer.phone}</p>
            <p><strong>Địa chỉ giao:</strong> {order.customer.address}</p>
            {order.customer.note && (
              <p><strong>Ghi chú:</strong> {order.customer.note}</p>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-500">Hình thức thanh toán:</span>
              <strong className="text-gray-800">
                {order.paymentMethod === 'MOMO'
                  ? '🟣 Ví MoMo'
                  : order.paymentMethod === 'BANK'
                  ? '💳 Chuyển khoản VietQR'
                  : order.paymentMethod === 'COD'
                  ? '💵 COD (Tiền mặt khi nhận)'
                  : 'Zalo xác nhận'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Trạng thái:</span>
              <strong className={order.paymentStatus === 'PAID' ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold' : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold'}>
                {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </strong>
            </div>
          </div>



          {/* VietQR Box if Unpaid and BANK */}
          {order.paymentStatus !== 'PAID' && order.paymentMethod === 'BANK' && (
            <div id="payment-box" className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  QR
                </div>
                <div>
                  <h4 className="font-black text-blue-700 uppercase text-xs">Chuyển Khoản VietQR</h4>
                  <p className="text-[11px] text-gray-500">Quét mã bằng app ngân hàng bất kỳ</p>
                </div>
              </div>

              {(() => {
                const qrUrl = `https://img.vietqr.io/image/${settings?.bankId || 'Vietcombank'}-${settings?.bankAccount || '1013388086'}-compact2.png?amount=${order.finalTotalAmount || order.totalAmount}&addInfo=${encodeURIComponent(`DH ${order.code}`)}&accountName=${encodeURIComponent(settings?.bankOwner || 'DUONG QUOC KHANH')}`;
                return (
                  <div className="flex flex-col items-center bg-blue-50/40 p-3 rounded-2xl border border-blue-100 text-center space-y-2">
                    <img
                      src={qrUrl}
                      alt="VietQR"
                      className="w-48 h-auto object-contain rounded-xl bg-white p-1 border border-blue-200"
                    />
                    <button
                      type="button"
                      disabled={isDownloadingQr}
                      onClick={() => downloadQrImage(qrUrl, `vietqr-omachi-${order.code}.png`)}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingQr ? 'Đang tải ảnh...' : '📥 Tải ảnh mã QR về máy (Để quét từ ảnh)'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Mở App <strong>Ngân hàng</strong> hoặc <strong>Ví MoMo</strong> &gt; Chọn <strong>Quét mã QR</strong>
                    </p>

                    {/* Hướng dẫn quét từ ảnh trên cùng 1 điện thoại */}
                    <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-[11px] text-blue-900 text-left space-y-1 w-full">
                      <p className="font-bold flex items-center gap-1 text-[11px] text-blue-800">
                        <span>💡</span>
                        <span>Thanh toán dễ dàng trên 1 chiếc điện thoại:</span>
                      </p>
                      <ol className="list-decimal list-inside space-y-0.5 text-[10.5px] text-blue-700 leading-relaxed">
                        <li>Bấm nút <strong>&quot;Tải ảnh mã QR về máy&quot;</strong> ở trên (hoặc chụp màn hình).</li>
                        <li>Mở App Ngân hàng hoặc MoMo &gt; Bấm <strong>Quét QR</strong>.</li>
                        <li>Chọn biểu tượng <strong>&quot;Ảnh / Thư viện&quot;</strong> để chọn mã vừa tải về là xong!</li>
                      </ol>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center px-1">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <strong className="text-gray-900 font-bold">{settings?.bankId || 'Vietcombank'}</strong>
                </div>

                <div className="flex justify-between items-center p-2 bg-blue-50/40 rounded-xl">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Số tài khoản:</span>
                    <strong className="font-mono text-gray-900 text-xs">{settings?.bankAccount || '1013388086'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings?.bankAccount || '1013388086', 'bankAccount')}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'bankAccount' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
                    <span>{copiedField === 'bankAccount' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <strong className="text-gray-900 uppercase">{settings?.bankOwner || 'DUONG QUOC KHANH'}</strong>
                </div>

                <div className="flex justify-between items-center p-2 bg-rose-50/40 rounded-xl">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Số tiền cần chuyển:</span>
                    <strong className="text-rose-600 font-bold text-xs">{formatVND(order.finalTotalAmount || order.totalAmount)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(order.finalTotalAmount || order.totalAmount), 'amount')}
                    className="px-2 py-1 bg-white hover:bg-rose-50 border border-rose-200 rounded text-[10px] font-bold text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'amount' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-rose-500" />}
                    <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 bg-amber-50/60 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-amber-800 block text-[10px] font-bold">Nội dung chuyển khoản:</span>
                    <strong className="text-blue-700 font-mono font-black text-xs">DH {order.code}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`DH ${order.code}`, 'memo')}
                    className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'memo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                    <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Contact Help */}
          <div className="bg-pink-50/70 p-4 rounded-3xl border border-pink-200 text-xs text-pink-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-pink-600" />
              <span>Cần hỗ trợ đổi mẫu charm / size tay gấp?</span>
            </p>
            <p className="text-[11px] text-gray-600">
              Nhắn tin ngay qua Zalo <strong>{settings?.hotline || settings?.zaloPhone || '0988.888.888'}</strong> kèm mã đơn <strong>#{order.code}</strong> để shop xử lý ngay!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
