'use client';

import React, { useState } from 'react';
import { Order, ShopSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, MessageCircle, Download } from 'lucide-react';

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

  if (!isOpen || !order) return null;

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

  const rawBank = (settings?.bankId || '').toUpperCase().trim();
  const bankId = rawBank.includes('VIETCOM') ? 'VCB' : rawBank.includes('MB') ? 'MB' : rawBank;
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
          {!bankAccount || !bankId ? (
            <div className="py-12 px-4 text-center space-y-3 bg-blue-50/40 rounded-2xl border border-blue-100">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-600 font-medium">Đang tải thông tin thanh toán từ hệ thống...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
              <div className="relative p-2 bg-white rounded-2xl border border-blue-200 shadow-sm">
                <img
                  src={vietQrUrl}
                  alt="Mã VietQR"
                  className="w-52 h-auto sm:w-60 object-contain rounded-xl"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap bg-blue-600">
                  Quét bằng App Ngân Hàng (VietQR)
                </div>
              </div>

              <p className="text-xs text-gray-600 pt-4 font-medium">
                Mở App <strong>Ngân hàng bất kỳ</strong> &gt; Chọn <strong>Quét mã QR</strong> để chuyển tiền nhanh tự động
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
            <div className="mt-3 p-3 bg-white rounded-xl border border-blue-100 text-[11px] text-blue-900 text-left space-y-1.5 w-full">
              <p className="font-bold flex items-center gap-1 text-[11px] text-blue-800">
                <span>💡</span>
                <span>Thanh toán dễ dàng trên 1 chiếc điện thoại:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-blue-700 leading-relaxed">
                <li>Bấm nút <strong>&quot;Tải ảnh mã QR về máy&quot;</strong> ở trên.</li>
                <li>Mở App Ngân hàng &gt; Bấm <strong>Quét QR</strong>.</li>
                <li>Chọn biểu tượng <strong>&quot;Ảnh / Thư viện&quot;</strong> để chọn mã vừa tải về là xong!</li>
              </ol>
            </div>
          </div>
          )}
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
