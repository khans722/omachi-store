'use client';

import React, { useMemo } from 'react';
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
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Check, 
  AlertCircle 
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
    toggleSelectProductGroup,
    subtotal,
    totalItems,
    selectedItems,
    selectedTotalItems,
    selectedSubtotal,
    isAllSelected,
  } = useCart();
  const { theme } = useTheme();

  // Gom nhóm sản phẩm theo mẫu để hiển thị chuyên nghiệp chuẩn Shopee
  const groupedProducts = useMemo(() => {
    const map = new Map<string, {
      product: (typeof items)[0]['product'];
      items: typeof items;
      totalQuantity: number;
      totalPrice: number;
      isAllSelected: boolean;
    }>();

    for (const item of items) {
      const pId = item.product.id;
      if (!map.has(pId)) {
        map.set(pId, {
          product: item.product,
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
          isAllSelected: true,
        });
      }
      const group = map.get(pId)!;
      group.items.push(item);
      group.totalQuantity += item.quantity;
      group.totalPrice += item.totalPrice;
      if (item.selected === false) {
        group.isAllSelected = false;
      }
    }

    return Array.from(map.values());
  }, [items]);

  const themeConfig = {
    green: {
      btnPrimary: 'bg-[#569440] hover:bg-[#467E33] text-white shadow-emerald-200',
      btnSecondary: 'border-[#D1EAC7] text-[#3E6B28] hover:bg-[#F2FAF0]',
      priceColor: 'text-[#4A8537]',
      cardBorder: 'border-[#DDEFD7]',
      activeBadge: 'bg-[#F2FAF0] text-[#3E6B28] border-[#D1EAC7]',
      checkboxAccent: 'accent-[#569440]',
      stepperBorder: 'border-[#D1EAC7]',
      headerPill: 'bg-[#F2FAF0] text-[#3E6B28] border-[#D1EAC7]',
      stickyBarBg: 'bg-white/95 border-emerald-100',
    },
    pink: {
      btnPrimary: 'bg-[#FF6B8B] hover:bg-[#E84878] text-white shadow-pink-200',
      btnSecondary: 'border-[#FFD0DE] text-[#D84A74] hover:bg-[#FFF0F5]',
      priceColor: 'text-[#E04573]',
      cardBorder: 'border-[#FFD6E4]',
      activeBadge: 'bg-[#FFF0F5] text-[#D84A74] border-[#FFD0DE]',
      checkboxAccent: 'accent-[#FF6B8B]',
      stepperBorder: 'border-[#FFD0DE]',
      headerPill: 'bg-[#FFF0F5] text-[#D84A74] border-[#FFD0DE]',
      stickyBarBg: 'bg-white/95 border-pink-100',
    },
    purple: {
      btnPrimary: 'bg-[#8E6ADF] hover:bg-[#7952C4] text-white shadow-purple-200',
      btnSecondary: 'border-[#E0D4FA] text-[#7952C4] hover:bg-[#F8F4FF]',
      priceColor: 'text-[#7952C4]',
      cardBorder: 'border-[#E6DCFA]',
      activeBadge: 'bg-[#F8F4FF] text-[#7952C4] border-[#E0D4FA]',
      checkboxAccent: 'accent-[#8E6ADF]',
      stepperBorder: 'border-[#E0D4FA]',
      headerPill: 'bg-[#F8F4FF] text-[#7952C4] border-[#E0D4FA]',
      stickyBarBg: 'bg-white/95 border-purple-100',
    },
    cream: {
      btnPrimary: 'bg-[#E59530] hover:bg-[#C97B1A] text-white shadow-amber-200',
      btnSecondary: 'border-[#FCE1B4] text-[#B56E16] hover:bg-[#FFFBF2]',
      priceColor: 'text-[#BA6C0D]',
      cardBorder: 'border-[#FCE5BF]',
      activeBadge: 'bg-[#FFFBF2] text-[#B56E16] border-[#FCE1B4]',
      checkboxAccent: 'accent-[#E59530]',
      stepperBorder: 'border-[#FCE1B4]',
      headerPill: 'bg-[#FFFBF2] text-[#B56E16] border-[#FCE1B4]',
      stickyBarBg: 'bg-white/95 border-amber-100',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  // Xóa các món đang được chọn
  const handleRemoveSelected = () => {
    const selectedIds = items.filter((i) => i.selected !== false).map((i) => i.id);
    selectedIds.forEach((id) => removeItem(id));
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-6 pb-28 sm:pb-32 animate-fade-in">
      
      {/* Top Header: Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link href="/" className="hover:text-stone-800 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tiếp tục mua hàng</span>
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-bold">Giỏ hàng của bạn</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="relative w-11 h-11 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <img
                src="/images/omachi_bear_hd.png"
                alt="Omachi Bear"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>Giỏ Hàng Omachi</span>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {totalItems > 0 
                  ? `Bạn đang có ${totalItems} sản phẩm (${groupedProducts.length} mẫu charm) trong giỏ`
                  : 'Giỏ hàng đang trống'}
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={clearCart}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* Notice Banner: Giao hàng SPX cân thực tế */}
      {items.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              Đơn hàng charm &amp; phụ kiện sẽ được shop đóng hộp cẩn thận, cân trọng lượng thực tế để áp mức phí ship SPX rẻ nhất!
            </span>
          </div>
          <span className="hidden md:inline font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-amber-300 text-amber-800 shrink-0">
            Thanh toán COD khi nhận
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-16 text-center space-y-5 shadow-xs">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-pink-50/80 border border-pink-100 flex items-center justify-center p-3 shadow-2xs">
            <img
              src="/images/omachi_bear_hd.png"
              alt="Empty Cart"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-stone-800">
              Giỏ hàng của bạn đang trống trơn!
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Bạn chưa chọn món đồ handmade nào. Hãy dạo quanh tiệm để rinh về những mẫu vòng charm, kẹp tóc hay túi mù kẹo ngọt nhé! 💕
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl ${curr.btnPrimary} text-white font-extrabold text-xs sm:text-sm shadow-md transition transform active:scale-95`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Khám Phá Sản Phẩm Ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Cart Table / Cards View (Chuẩn Shopee) */
        <div className="space-y-4">
          
          {/* Table Header Row (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3.5 bg-white rounded-2xl border border-stone-200/80 text-xs font-bold text-stone-600 shadow-2xs items-center">
            <div className="col-span-6 flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className={`w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.checkboxAccent}`}
              />
              <span>Sản Phẩm ({totalItems} món)</span>
            </div>
            <div className="col-span-2 text-center">Đơn Giá</div>
            <div className="col-span-2 text-center">Số Lượng</div>
            <div className="col-span-2 text-right">Số Tiền</div>
          </div>

          {/* Product Groups */}
          <div className="space-y-4">
            {groupedProducts.map((group) => (
              <div
                key={group.product.id}
                className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs space-y-0"
              >
                {/* Group Title Bar */}
                <div className="p-3.5 sm:p-4 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={group.isAllSelected}
                      onChange={() => toggleSelectProductGroup(group.product.id, !group.isAllSelected)}
                      className={`w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.checkboxAccent}`}
                      title="Chọn tất cả phân loại của sản phẩm này"
                    />
                    <Link
                      href={`/product/${group.product.id}`}
                      className="flex items-center gap-2.5 min-w-0 group"
                    >
                      <img
                        src={group.product.images[0] || '/images/charm_feed_1.jpg'}
                        alt={group.product.name}
                        className="w-10 h-10 object-cover rounded-xl border border-stone-200 bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-black text-stone-800 group-hover:text-rose-600 transition truncate">
                          {group.product.name}
                        </h3>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {group.items.length} phân loại • Tổng {group.totalQuantity} sản phẩm
                        </span>
                      </div>
                    </Link>
                  </div>

                  <Link
                    href={`/product/${group.product.id}`}
                    className="text-[11px] font-bold text-stone-500 hover:text-stone-800 transition shrink-0 hidden sm:inline"
                  >
                    Xem chi tiết →
                  </Link>
                </div>

                {/* Variation Items */}
                <div className="divide-y divide-stone-100">
                  {group.items.map((item) => {
                    const isChecked = item.selected !== false;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 transition-colors ${
                          isChecked ? 'bg-white' : 'bg-stone-50/40 opacity-70'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                          
                          {/* Col 1: Checkbox & Variant info */}
                          <div className="md:col-span-6 flex items-start sm:items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectItem(item.id)}
                              className={`w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer mt-1 sm:mt-0 shrink-0 ${curr.checkboxAccent}`}
                            />

                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {item.selectedVariant?.colorHex && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                                  style={{ backgroundColor: item.selectedVariant.colorHex }}
                                />
                              )}
                              <div className="min-w-0">
                                <p className={`text-xs sm:text-sm font-extrabold ${isChecked ? 'text-stone-900' : 'text-stone-500'}`}>
                                  {item.selectedVariant ? item.selectedVariant.name : 'Phân loại mặc định'}
                                  {item.selectedPackage ? ` • ${item.selectedPackage.name}` : ''}
                                </p>
                                {item.customNote && (
                                  <p className="text-[11px] text-stone-400 italic mt-0.5">
                                    Ghi chú: &quot;{item.customNote}&quot;
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Đơn giá */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-center text-xs">
                            <span className="md:hidden text-stone-500">Đơn giá:</span>
                            <span className="font-semibold text-stone-700">
                              {formatVND(item.unitPrice)}
                            </span>
                          </div>

                          {/* Col 3: Stepper Tăng giảm */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                            <span className="md:hidden text-xs text-stone-500">Số lượng:</span>
                            <div className={`flex items-center border ${curr.stepperBorder} rounded-xl bg-white shadow-2xs overflow-hidden`}>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition active:scale-95 cursor-pointer"
                                title="Giảm 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val >= 1) updateQuantity(item.id, val);
                                }}
                                className="w-12 h-8 text-center text-xs font-black text-stone-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition active:scale-95 cursor-pointer"
                                title="Tăng 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Col 4: Thành tiền & Xóa */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                            <div className="text-right">
                              <span className="md:hidden text-xs text-stone-500 block">Thành tiền:</span>
                              <span className={`text-sm sm:text-base font-black ${curr.priceColor}`}>
                                {formatVND(item.totalPrice)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Xóa món này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Sticky Bottom Shopee-style Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl py-3 sm:py-4 px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Select all & Delete selected */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className={`w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer ${curr.checkboxAccent}`}
                />
                <span>Chọn tất cả ({totalItems})</span>
              </label>

              <button
                type="button"
                onClick={handleRemoveSelected}
                disabled={selectedTotalItems === 0}
                className="text-xs text-stone-500 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-stone-500 transition font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa đã chọn ({selectedTotalItems})</span>
              </button>
            </div>

            {/* Right: Subtotal & Checkout button */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-5">
              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1.5 sm:justify-end">
                  <span className="text-xs text-stone-500 font-medium">
                    Tổng thanh toán ({selectedTotalItems} món):
                  </span>
                  <span className={`text-lg sm:text-2xl font-black ${curr.priceColor}`}>
                    {formatVND(selectedSubtotal)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block font-normal">
                  Chưa bao gồm phí ship SPX (báo sau khi cân)
                </span>
              </div>

              {selectedTotalItems > 0 ? (
                <Link
                  href="/checkout"
                  className={`py-3 sm:py-3.5 px-6 sm:px-8 rounded-2xl ${curr.btnPrimary} font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-98 shrink-0`}
                >
                  <span>Mua Hàng ({selectedTotalItems})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="py-3 sm:py-3.5 px-6 sm:px-8 rounded-2xl bg-stone-200 text-stone-400 font-bold text-xs sm:text-sm cursor-not-allowed shrink-0"
                >
                  Mua Hàng (0)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
