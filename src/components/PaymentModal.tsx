'use client';

import React, { useState } from 'react';
import { Order, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, Check, Copy, MessageCircle, ShieldCheck, Download } from 'lucide-react';

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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
  const transferContent = `DH ${orderCode}`;

  const bankId = settings?.bankId || 'Vietcombank';
  const bankAccount = settings?.bankAccount || '1013388086';
  const bankOwner = settings?.bankOwner || 'DUONG QUOC KHANH';
  const hotline = settings?.hotline || settings?.zaloPhone || '0375408256';
  const zaloUrl = settings?.zaloOfficialUrl || `https://zalo.me/${hotline.replace(/[^0-9]/g, '')}`;

  const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(bankOwner)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 text-white flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shrink-0">
              💳
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wide">
                Chuyển Khoản VietQR
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* VietQR Code Container */}
          <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
            <div className="relative p-2 bg-white rounded-2xl border border-blue-200 shadow-sm">
              <img
                src={vietQrUrl}
                alt="Mã VietQR"
                className="w-48 h-auto sm:w-56 object-contain rounded-xl"
              />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap bg-blue-600">
                Quét bằng App Ngân Hàng hoặc MoMo
              </div>
            </div>

            <p className="text-xs text-gray-500 pt-3.5 font-medium">
              Mở App <strong>Ngân hàng bất kỳ</strong> hoặc <strong>Ví MoMo</strong> &gt; Chọn <strong>Quét mã QR</strong> để chuyển tiền nhanh tự động
            </p>

            {/* Nút tải mã QR về máy dành cho khách dùng 1 điện thoại */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => downloadQrImage(vietQrUrl, `vietqr-omachi-${orderCode}.png`)}
              className="mt-3 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Đang tải ảnh...' : '📥 Tải ảnh mã QR về máy (Để quét từ ảnh)'}</span>
            </button>

            {/* Hướng dẫn quét từ ảnh */}
            <div className="mt-2 p-2.5 bg-white rounded-xl border border-blue-100 text-[11px] text-blue-900 text-left space-y-1 w-full">
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

          {/* Copyable Details */}
          <div className="space-y-2 text-xs">
            <p className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">
              Hoặc chuyển khoản thủ công:
            </p>

            {/* Row: Bank Name */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500">Ngân hàng:</span>
              <strong className="text-gray-900 font-bold">{bankId}</strong>
            </div>

            {/* Row: Account Number */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-500 block text-[11px]">Số tài khoản:</span>
                <strong className="font-mono text-gray-900 text-sm">{bankAccount}</strong>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(bankAccount, 'account')}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'account' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Row: Account Owner */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500">Chủ tài khoản:</span>
              <strong className="text-gray-900 font-bold uppercase">{bankOwner}</strong>
            </div>

            {/* Row: Amount */}
            <div className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
              <div>
                <span className="text-gray-500 block text-[11px]">Số tiền thanh toán:</span>
                <strong className="text-rose-600 font-black text-sm">{formatVND(amount)}</strong>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(String(amount), 'amount')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'amount' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Row: Transfer Content / Memo */}
            <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
              <div>
                <span className="text-amber-800 block text-[11px] font-bold">Nội dung chuyển khoản (bắt buộc):</span>
                <strong className="font-mono text-blue-700 font-black text-sm">{transferContent}</strong>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(transferContent, 'memo')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'memo' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-700" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hệ thống tự động xác nhận sau khi nhận tiền. Bạn cũng có thể nhắn tin Zalo để shop hỗ trợ nhanh nhé!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
          <a
            href={`${zaloUrl}?text=${encodeURIComponent(`Chào shop Omachi, mình vừa chuyển khoản thanh toán đơn hàng #${orderCode}. Shop kiểm tra giúp mình nhé!`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Báo Zalo</span>
          </a>

          <button
            type="button"
            onClick={() => {
              if (onPaymentConfirmed) onPaymentConfirmed();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer text-center"
          >
            ✓ Tôi đã chuyển khoản xong
          </button>
        </div>
      </div>
    </div>
  );
}
