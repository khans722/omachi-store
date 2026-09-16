'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order, OrderStatus, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { CheckCircle2, Clock, PackageCheck, Truck, Sparkles, ArrowLeft, Phone, Check, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderCode = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error(err);
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
                    <span>Phí vận chuyển ({order.carrierName || 'SPX Express'}):</span>
                  </span>
                  <span className="font-bold text-gray-800">
                    {shippingFee > 0 ? (
                      <span className="text-rose-600">+{formatVND(shippingFee)}</span>
                    ) : order.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí (0đ)</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Báo sau khi cân</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-pink-100 font-black text-base text-pink-600">
                  <span>Tổng thanh toán:</span>
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
            <p><strong>Hình thức:</strong> {order.paymentMethod === 'ZALO_CONFIRM' ? 'Chốt đơn & thanh toán qua Zalo' : 'COD (Tiền mặt)'}</p>
          </div>

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
