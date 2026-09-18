'use client';

import React, { useState, useEffect } from 'react';
import { Order, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, MessageCircle, Download, Loader2, Copy, Check, Zap } from 'lucide-react';
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
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkPaymentNotice, setCheckPaymentNotice] = useState('');

  const handleCheckPaymentNow = async () => {
    if (!order) return;
    setIsCheckingPayment(true);
    setCheckPaymentNotice('');
    try {
      const res = await fetch('/api/orders/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, code: order.code }),
      });
      const data = await res.json();
      if (data.success && data.isPaid) {
        setIsPaidSuccess(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        if (onPaymentConfirmed) onPaymentConfirmed();
      } else {
        setCheckPaymentNotice(data.message || 'Đã gửi thông báo xác nhận đến shop! Shop sẽ duyệt đơn cho bạn trong giây lát nhé 💕');
        setTimeout(() => setCheckPaymentNotice(''), 7000);
      }
    } catch (e) {
      setCheckPaymentNotice('Đã gửi thông báo xác nhận đến shop! Shop sẽ duyệt đơn cho bạn trong giây lát nhé 💕');
      setTimeout(() => setCheckPaymentNotice(''), 7000);
    } finally {
      setIsCheckingPayment(false);
    }
  };

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
  const displayBankName = isVietin ? 'VietinBank' : rawBank.includes('VIETCOM') ? 'Vietcombank' : rawBank.includes('MB') ? 'MB Bank' : (rawBank || 'VietinBank');
  const transferContent = isVietin ? `SEVQR DH ${orderCode}` : `DH ${orderCode}`;
  const bankAccount = (settings?.bankAccount || '').trim();
  const bankOwner = (settings?.bankOwner || 'DUONG QUOC KHANH').trim().toUpperCase();
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
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 text-white flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
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
                <div className="flex flex-col items-center text-center p-4 sm:p-5 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
                  <div className="p-2.5 sm:p-3 bg-white rounded-2xl border border-blue-200 shadow-sm">
                    <img
                      src={vietQrUrl}
                      alt="Mã VietQR"
                      className="w-52 h-52 sm:w-60 sm:h-60 aspect-square object-contain rounded-xl"
                    />
                  </div>

                  {/* Nút tải mã QR */}
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => downloadQrImage(vietQrUrl, `vietqr-omachi-${orderCode}.png`)}
                    className="w-full sm:max-w-xs py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Đang tải...' : 'Tải mã QR'}</span>
                  </button>

                  {/* Nút kiểm tra thanh toán ngay */}
                  <button
                    type="button"
                    onClick={handleCheckPaymentNow}
                    disabled={isCheckingPayment}
                    className="w-full sm:max-w-xs py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-60"
                  >
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                        <span>Đang kiểm tra giao dịch...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                        <span>Tôi đã chuyển khoản xong • Kiểm tra ngay</span>
                      </>
                    )}
                  </button>

                  {checkPaymentNotice && (
                    <div className="w-full sm:max-w-xs p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium animate-fade-in shadow-2xs">
                      {checkPaymentNotice}
                    </div>
                  )}

                  {/* Bảng thông tin chuyển khoản: Gọn gàng 1 khung duy nhất, nút sao chép dạng pill tinh gọn */}
                  <div className="w-full bg-stone-50/90 border border-stone-200 rounded-2xl p-3 sm:p-3.5 space-y-2.5 text-xs text-left">
                    {/* Hàng 1: Ngân hàng & Chủ tài khoản */}
                    <div className="flex items-center justify-between gap-2 px-1 text-xs">
                      <div>
                        <span className="text-stone-400 font-medium">Ngân hàng: </span>
                        <strong className="text-stone-900 font-extrabold">{displayBankName}</strong>
                      </div>
                      <div className="text-right truncate">
                        <span className="text-stone-400 font-medium">Chủ TK: </span>
                        <strong className="text-stone-900 font-extrabold uppercase">{bankOwner}</strong>
                      </div>
                    </div>

                    {/* Hàng 2: Số tài khoản dạng pill */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/70 px-1">
                      <span className="text-stone-600 text-xs font-semibold">Số tài khoản:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankAccount, 'stk')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-300 hover:border-blue-400 hover:bg-blue-50/40 text-blue-700 font-mono text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                        title="Bấm để sao chép số tài khoản"
                      >
                        <span>{bankAccount}</span>
                        {copiedField === 'stk' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </button>
                    </div>

                    {/* Hàng 3: Nội dung CK dạng pill */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/70 px-1">
                      <span className="text-stone-600 text-xs font-semibold">Nội dung CK:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(transferContent, 'nd')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-300 hover:bg-amber-100/80 text-rose-600 font-mono text-xs font-black transition shadow-2xs cursor-pointer active:scale-95"
                        title="Bấm để sao chép nội dung chuyển khoản"
                      >
                        <span>{transferContent}</span>
                        {copiedField === 'nd' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Trạng thái thanh toán: Gọn gàng, không rườm rà */}
              <div className="py-2.5 px-3.5 bg-blue-50/90 border border-blue-200/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-blue-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                <span>Đang chờ chuyển khoản (Tự động cập nhật qua SePay)</span>
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
