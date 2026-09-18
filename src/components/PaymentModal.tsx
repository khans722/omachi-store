'use client';

import React, { useState, useEffect } from 'react';
import { Order, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, MessageCircle, Download, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  order: Order | null;
  settings: ShopSettings | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed?: () => void;
}

export default function PaymentModal({
  order,
  settings,
  isOpen,
  onClose,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Auto-polling SePay
  useEffect(() => {
    if (!isOpen || !order) return;
    if (order.paymentStatus === 'PAID') {
      setIsPaidSuccess(true);
      return;
    }

    setIsPaidSuccess(false);
    let isMounted = true;

    const checkOrderPayment = async () => {
      try {
        const orderIdOrCode = order.id || order.code;
        const res = await fetch(`/api/orders/${encodeURIComponent(orderIdOrCode)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          const freshOrder = data.data;
          if (freshOrder.paymentStatus === 'PAID') {
            if (isMounted) {
              setIsPaidSuccess(true);
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.5 },
              });
              if (onPaymentConfirmed) {
                onPaymentConfirmed();
              }
            }
          }
        }
      } catch (err) {}
    };

    const firstTimer = setTimeout(checkOrderPayment, 1200);
    const intervalId = setInterval(checkOrderPayment, 2500);

    return () => {
      isMounted = false;
      clearTimeout(firstTimer);
      clearInterval(intervalId);
    };
  }, [isOpen, order?.id, order?.code, order?.paymentStatus, onPaymentConfirmed]);

  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(() => {});
    }
  };

  const downloadQrImage = async (url: string, filename: string) => {
    setIsDownloading(true);
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
      setIsDownloading(false);
    }
  };

  const amount = Number(order.finalTotalAmount || order.totalAmount || 0);
  const orderCode = order.code || order.id;

  const rawBank = (settings?.bankId || '').toUpperCase().trim();
  const isVietin = rawBank.includes('VIETIN') || rawBank.includes('CTG') || rawBank.includes('ICB') || (settings?.bankAccount || '').trim() === '106873248315';
  const bankId = rawBank.includes('VIETCOM') ? 'VCB' : rawBank.includes('MB') ? 'MB' : isVietin ? 'ICB' : rawBank;
  const transferContent = isVietin ? `SEVQR DH ${orderCode}` : `DH ${orderCode}`;
  const bankAccount = (settings?.bankAccount || '').trim();
  const bankOwner = (settings?.bankOwner || '').trim();
  const hotline = (settings?.hotline || settings?.zaloPhone || '').trim();
  const zaloUrl = settings?.zaloOfficialUrl || (hotline ? `https://zalo.me/${hotline.replace(/[^0-9]/g, '')}` : 'https://zalo.me');

  const vietQrUrl = bankAccount && bankId
    ? `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
        transferContent
      )}&accountName=${encodeURIComponent(bankOwner)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 text-white flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shrink-0">
              {isPaidSuccess ? '🎉' : '💳'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wide">
                {isPaidSuccess ? 'Thanh Toán Thành Công' : 'Chuyển Khoản VietQR'}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                Đơn hàng: <strong className="font-mono text-white">#{orderCode}</strong> • {formatVND(amount)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {isPaidSuccess ? (
            /* Khi SePay đã khớp thanh toán thành công */
            <div className="py-6 px-4 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs animate-bounce">
                ✓
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  ✅ ĐÃ THANH TOÁN THÀNH CÔNG (SEPAY)
                </span>
                <h4 className="text-lg font-black text-gray-900 pt-1">
                  Đơn hàng #{orderCode}
                </h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Hệ thống SePay đã nhận đủ tiền thanh toán. Xưởng Omachi đã tiếp nhận đơn và đang chuẩn bị đóng gói xuất kho cho bạn! 💕
                </p>
              </div>
            </div>
          ) : (
            /* Màn hình chờ chuyển khoản VietQR */
            <>
              {!bankAccount || !bankId ? (
                <div className="py-12 px-4 text-center space-y-3 bg-blue-50/40 rounded-2xl border border-blue-100">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-600 font-medium">Đang tải thông tin thanh toán từ hệ thống...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-2.5">
                  <div className="relative p-2 bg-white rounded-2xl border border-blue-200 shadow-sm">
                    <img
                      src={vietQrUrl}
                      alt="Mã VietQR"
                      className="w-48 h-auto sm:w-56 object-contain rounded-xl"
                    />
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap bg-blue-600">
                      Quét bằng App Ngân Hàng
                    </div>
                  </div>

                  {/* Nút tải mã QR về máy */}
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => downloadQrImage(vietQrUrl, `vietqr-omachi-${orderCode}.png`)}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Đang tải ảnh...' : '📥 Tải ảnh mã QR về máy (Để quét từ thư viện)'}</span>
                  </button>

                  {/* Bảng thông tin chuyển khoản có nút Copy 1 chạm */}
                  <div className="grid grid-cols-2 gap-2 text-left w-full pt-1">
                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <span className="text-[10px] text-gray-500 block font-medium">Ngân hàng:</span>
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        {rawBank || 'VietinBank'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-gray-500 block font-medium">Số tài khoản:</span>
                        <span className="text-xs font-extrabold text-blue-700 font-mono block truncate">
                          {bankAccount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankAccount, 'stk')}
                        className="px-1.5 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded shrink-0 transition cursor-pointer"
                      >
                        {copiedField === 'stk' ? '✓' : 'Copy'}
                      </button>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <span className="text-[10px] text-gray-500 block font-medium">Chủ tài khoản:</span>
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        {bankOwner || 'DUONG QUOC KHANH'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-amber-800 block font-bold">Nội dung CK:</span>
                        <span className="text-xs font-black text-rose-600 font-mono block truncate">
                          {transferContent}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(transferContent, 'nd')}
                        className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded shrink-0 transition cursor-pointer"
                      >
                        {copiedField === 'nd' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Trạng thái tự động: Siêu gọn 1 dòng */}
              <div className="py-2 px-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-blue-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                <span>Đang chờ thanh toán (Tự động duyệt khi có tiền)</span>
              </div>
            </>
          )}
        </div>

        {/* Footer actions: KHÔNG CÓ NÚT THỦ CÔNG "TÔI ĐÃ CHUYỂN KHOẢN XONG" */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
          <a
            href={`${zaloUrl}?text=${encodeURIComponent(`Chào shop Omachi, mình cần hỗ trợ đơn hàng #${orderCode}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Nhắn Zalo shop</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isPaidSuccess ? 'Xong' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
}
