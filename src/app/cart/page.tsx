'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { formatVND } from '@/lib/utils';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  Truck, 
  Tag,
  ChevronRight
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
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

  // Xóa các món đang được chọn
  const handleRemoveSelected = () => {
    const selectedIds = items.filter((i) => i.selected !== false).map((i) => i.id);
    selectedIds.forEach((id) => removeItem(id));
  };

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-3 pb-28 font-sans animate-fade-in">
      
      {/* 1. TOP APP BAR / BREADCRUMB */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1 -ml-1 text-stone-600 hover:text-[#ee4d2d] transition rounded-lg"
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

      {/* 2. MAIN CONTENT AREA */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center p-2.5 shadow-2xs">
            <img
              src="/images/omachi_bear_hd.png"
              alt="Giỏ hàng trống"
              className="w-full h-full object-contain drop-shadow-xs"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95"
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
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer accent-[#ee4d2d]"
                title="Chọn tất cả sản phẩm"
              />
              <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
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
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer accent-[#ee4d2d]"
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
                        <h3 className="text-xs sm:text-sm font-normal text-stone-900 group-hover:text-[#ee4d2d] transition line-clamp-1 sm:line-clamp-2 leading-snug">
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
                      {/* Unit Price */}
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-sm sm:text-base font-black text-[#ee4d2d]">
                          {formatVND(item.unitPrice)}
                        </span>
                        {item.product?.originalPrice && item.product.originalPrice > item.unitPrice && (
                          <span className="text-[10px] text-stone-400 line-through truncate hidden sm:inline">
                            {formatVND(item.product.originalPrice)}
                          </span>
                        )}
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

          {/* Shop Voucher Row */}
          <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#ee4d2d]" />
              <span className="font-medium text-xs">Voucher &amp; Chiết khấu mua sỉ Omachi</span>
            </div>
            <span className="text-[11px] text-[#ee4d2d] font-semibold flex items-center gap-1">
              Áp dụng tại bước thanh toán <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </span>
          </div>

          {/* SPX Delivery Row */}
          <div className="p-2.5 bg-amber-50/50 border-t border-amber-100/60 flex items-center gap-2 text-xs text-amber-900">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] text-amber-800">
              Giao hàng SPX Express • Shop đóng gói cân thực tế để tính cước rẻ nhất
            </span>
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
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer accent-[#ee4d2d]"
              />
              <span>Tất cả</span>
              <span className="text-stone-400 text-xs font-normal">({totalItems})</span>
            </label>

            {/* Right: Total price & Buy button */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="text-right">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-xs text-stone-600 hidden sm:inline">Tổng thanh toán:</span>
                  <span className="text-base sm:text-lg font-black text-[#ee4d2d]">
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
                  className="bg-[#ee4d2d] hover:bg-[#d73211] active:bg-[#c2280a] text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm shadow-md transition transform active:scale-98 flex items-center justify-center min-w-[120px]"
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
