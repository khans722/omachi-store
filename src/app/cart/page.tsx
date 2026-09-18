'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { formatVND } from '@/lib/utils';
import { ShopSettings } from '@/types';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  Truck, 
  ChevronRight
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('omachi_shop_settings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }
    } catch (e) {}

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
          try {
            localStorage.setItem('omachi_shop_settings', JSON.stringify(data.data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    toggleSelectItem,
    toggleSelectAll,
    totalItems,
    selectedItems,
    selectedTotalItems,
    selectedSubtotal,
    isAllSelected,
  } = useCart();
  const { theme } = useTheme();
  const themeConfig = {
    green: {
      btnPrimary: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] hover:from-[#629744] hover:to-[#6EA64E] text-white shadow-md shadow-[#DCEDCE]',
      priceText: 'text-[#3E6B28]',
      accentText: 'text-[#456F2F]',
      badgeBg: 'bg-[#78B159]',
      accentCheckbox: 'accent-[#78B159]',
      hoverText: 'group-hover:text-[#3E6B28] hover:text-[#3E6B28]',
    },
    pink: {
      btnPrimary: 'bg-gradient-to-r from-[#E0688E] to-[#F0789E] hover:from-[#CF587E] hover:to-[#E0688E] text-white shadow-md shadow-[#FAD1DE]',
      priceText: 'text-[#9E2B54]',
      accentText: 'text-[#9E2B54]',
      badgeBg: 'bg-[#F0789E]',
      accentCheckbox: 'accent-[#F0789E]',
      hoverText: 'group-hover:text-[#9E2B54] hover:text-[#9E2B54]',
    },
    purple: {
      btnPrimary: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] hover:from-[#7C5EB8] hover:to-[#8C6EC8] text-white shadow-md shadow-[#E0D4FA]',
      priceText: 'text-[#613CA8]',
      accentText: 'text-[#613CA8]',
      badgeBg: 'bg-[#9C80D8]',
      accentCheckbox: 'accent-[#9C80D8]',
      hoverText: 'group-hover:text-[#613CA8] hover:text-[#613CA8]',
    },
    cream: {
      btnPrimary: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] hover:from-[#C7882C] hover:to-[#D6973A] text-white shadow-md shadow-[#F7E4BE]',
      priceText: 'text-[#8E5A13]',
      accentText: 'text-[#8E5A13]',
      badgeBg: 'bg-[#E5A84B]',
      accentCheckbox: 'accent-[#E5A84B]',
      hoverText: 'group-hover:text-[#8E5A13] hover:text-[#8E5A13]',
    },
  };
  const curr = themeConfig[theme] || themeConfig.green;

  // Xóa các món đang được chọn
  const handleRemoveSelected = () => {
    const selectedIds = items.filter((i) => i.selected !== false).map((i) => i.id);
    selectedIds.forEach((id) => removeItem(id));
  };

  const FREESHIP_THRESHOLD = settings?.prepaidFreeShipThreshold !== undefined && settings?.prepaidFreeShipThreshold !== null
    ? Number(settings.prepaidFreeShipThreshold)
    : (settings?.freeShippingThreshold !== undefined && settings?.freeShippingThreshold !== null ? Number(settings.freeShippingThreshold) : 0);
  const isPrepaidFreeshipEnabled = settings?.enablePrepaidFreeShip !== false && FREESHIP_THRESHOLD > 0;
  const isFreeshipEligible = isPrepaidFreeshipEnabled && selectedSubtotal >= FREESHIP_THRESHOLD;
  const missingForFreeship = Math.max(0, FREESHIP_THRESHOLD - selectedSubtotal);
  const freeshipProgress = FREESHIP_THRESHOLD > 0 ? Math.min(100, Math.round((selectedSubtotal / FREESHIP_THRESHOLD) * 100)) : 100;

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-3 pb-28 font-sans animate-fade-in">
      
      {/* 1. TOP APP BAR / BREADCRUMB */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`p-1 -ml-1 text-stone-600 ${curr.hoverText} transition rounded-lg`}
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-base sm:text-xl font-black text-stone-900">Giỏ hàng</h1>
            <span className="text-xs text-stone-400 font-medium">({totalItems})</span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedTotalItems > 0 && (
              <button
                type="button"
                onClick={handleRemoveSelected}
                className="text-xs text-stone-500 hover:text-rose-600 transition font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa đã chọn</span> ({selectedTotalItems})
              </button>
            )}
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-stone-400 hover:text-rose-600 transition"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* FREESHIP PROMOTION PROGRESS BANNER */}
      {items.length > 0 && isPrepaidFreeshipEnabled && (
        <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
          isFreeshipEligible
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 shadow-xs'
            : 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border-amber-200/80 shadow-2xs'
        }`}>
          <div className="flex items-start sm:items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg shrink-0">
                {isFreeshipEligible ? '🎉' : '🎁'}
              </span>
              <div>
                <p className={`text-xs sm:text-sm font-black ${
                  isFreeshipEligible ? 'text-emerald-800' : 'text-stone-800'
                }`}>
                  {isFreeshipEligible ? (
                    <span>Đã đủ điều kiện <span className="text-emerald-600 underline decoration-emerald-400">MIỄN PHÍ SHIP</span> khi Chuyển Khoản VietQR!</span>
                  ) : (
                    <span>Mua thêm <strong className="text-rose-600 font-black">{formatVND(missingForFreeship)}</strong> để được <strong className="text-emerald-700">MIỄN PHÍ SHIP</strong> khi Chuyển Khoản VietQR!</span>
                  )}
                </p>
                <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
                  Áp dụng cho đơn hàng từ {formatVND(FREESHIP_THRESHOLD)} thanh toán Chuyển Khoản VietQR toàn quốc
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${
              isFreeshipEligible
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {freeshipProgress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeshipEligible
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${freeshipProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-32 h-32 sm:w-44 sm:h-44 mx-auto flex items-center justify-center select-none">
            <img
              src="/images/omachi_hamster_clean.png"
              alt="Giỏ hàng trống"
              className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-black text-stone-800">
              Giỏ hàng của bạn đang trống!
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Hãy chọn những mẫu charm hoa, kẹp tóc hay vòng cườm xinh xắn để bắt đầu mua sắm nhé! 💕
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl ${curr.btnPrimary} font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Khám Phá Sản Phẩm Ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3. SHOPEE STYLE COMPACT CART CARD */
        <div className="bg-white rounded-xl shadow-2xs border border-stone-100 overflow-hidden">
          
          {/* Shop Header Bar (Chuẩn Shopee) */}
          <div className="p-3 sm:p-3.5 bg-white border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.accentCheckbox}"
                title="Chọn tất cả sản phẩm"
              />
              <span className={`${curr.badgeBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs`}>
                Yêu thích
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-0.5">
                🌸 Omachi Handmade Studio
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {totalItems} sản phẩm
            </span>
          </div>

          {/* Shopee Cart Items List (1 Hàng Ngang Duy Nhất Mỗi Món) */}
          <div className="divide-y divide-stone-100">
            {items.map((item) => {
              const isChecked = item.selected !== false;

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 transition-colors ${
                    isChecked ? 'bg-white' : 'bg-stone-50/40 opacity-75'
                  }`}
                >
                  {/* 1. Checkbox */}
                  <div className="pt-7 sm:pt-6 shrink-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.accentCheckbox}"
                    />
                  </div>

                  {/* 2. Product Thumbnail */}
                  <Link
                    href={`/product/${item.product?.id || ''}`}
                    className="shrink-0 group"
                  >
                    <img
                      src={item.product?.images?.[0] || '/images/charm_feed_1.jpg'}
                      alt={item.product?.name || 'Sản phẩm'}
                      className="w-20 h-20 sm:w-22 sm:h-22 object-cover rounded-lg border border-stone-100 bg-stone-50 group-hover:opacity-90 transition"
                    />
                  </Link>

                  {/* 3. Info Column: Title + Variant Pill + Price & Stepper */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[80px]">
                    <div>
                      {/* Product Name */}
                      <Link
                        href={`/product/${item.product?.id || ''}`}
                        className="block group"
                      >
                        <h3 className="text-xs sm:text-sm font-normal text-stone-900 ${curr.hoverText} transition line-clamp-1 sm:line-clamp-2 leading-snug">
                          {item.product?.name}
                        </h3>
                      </Link>

                      {/* Shopee Variant Pill */}
                      <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-[11px] px-2 py-0.5 rounded-xs font-medium max-w-full truncate">
                          {item.selectedVariant?.colorHex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: item.selectedVariant.colorHex }}
                            />
                          )}
                          <span className="truncate">
                            Phân loại: {item.selectedVariant ? item.selectedVariant.name : 'Tiêu chuẩn'}
                            {item.selectedPackage ? ` • ${item.selectedPackage.name}` : ''}
                          </span>
                          <span className="text-[8px] text-stone-400 ml-0.5">▼</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Price on left, Stepper & Delete on right */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Unit Price & % Discount */}
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                      <span className={`text-sm sm:text-base font-black ${curr.priceText}`}>
                        {formatVND(item.unitPrice)}
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">/cái</span>

                      {(() => {
                        const base = item.product?.basePrice || item.unitPrice;
                        const discountPercent = base > item.unitPrice
                          ? Math.round(((base - item.unitPrice) / base) * 100)
                          : 0;
                        if (discountPercent > 0) {
                          return (
                            <>
                              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                -{discountPercent}%
                              </span>
                              <span className="text-[10px] text-stone-400 line-through truncate">
                                {formatVND(base)}
                              </span>
                            </>
                          );
                        }
                        if (item.product?.originalPrice && item.product.originalPrice > item.unitPrice) {
                          return (
                            <span className="text-[10px] text-stone-400 line-through truncate hidden sm:inline">
                              {formatVND(item.product.originalPrice)}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                      {/* Stepper & Trash Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-stone-200 rounded-sm bg-white overflow-hidden h-6 sm:h-7 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition cursor-pointer"
                            title="Giảm 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1) updateQuantity(item.id, val);
                            }}
                            className="w-8 sm:w-10 text-center text-xs font-black text-stone-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition cursor-pointer"
                            title="Tăng 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-stone-300 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa món này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>


          {/* SPX Delivery Row */}
          <div className="p-2.5 bg-amber-50/50 border-t border-amber-100/60 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] text-amber-800">
                {isPrepaidFreeshipEnabled ? (
                  <>Giao hàng SPX Express • Đơn từ {formatVND(FREESHIP_THRESHOLD)} <strong className="text-emerald-700 font-bold">MIỄN PHÍ SHIP (0đ)</strong> khi Chuyển Khoản</>
                ) : (
                  <>Giao hàng SPX Express • Hỗ trợ giao nhanh toàn quốc</>
                )}
              </span>
            </div>
            {isFreeshipEligible && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                Đủ điều kiện 0đ ship
              </span>
            )}
          </div>

        </div>
      )}

      {/* 4. SHOPEE STICKY BOTTOM CHECKOUT BAR */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-stone-200 shadow-2xl safe-area-bottom">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            
            {/* Left: Select all checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-bold text-stone-800 shrink-0">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.accentCheckbox}"
              />
              <span>Tất cả</span>
              <span className="text-stone-400 text-xs font-normal">({totalItems})</span>
            </label>

            {/* Right: Total price & Buy button */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="text-right">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-xs text-stone-600 hidden sm:inline">Tổng thanh toán:</span>
                  <span className={`text-base sm:text-lg font-black ${curr.priceText}`}>
                    {formatVND(selectedSubtotal)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block sm:hidden">
                  (Chưa tính ship)
                </span>
              </div>

              {selectedTotalItems > 0 ? (
                <Link
                  href="/checkout"
                  className={`${curr.btnPrimary} font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm transition transform active:scale-98 flex items-center justify-center min-w-[120px]`}
                >
                  Mua hàng ({selectedTotalItems})
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="bg-stone-300 text-stone-500 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm cursor-not-allowed min-w-[120px]"
                >
                  Mua hàng (0)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
