'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { formatVND } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ArrowRight, Sparkles, Zap, MessageCircle } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    toggleSelectItem,
    toggleSelectAll,
    toggleSelectProductGroup,
    subtotal,
    totalSavings,
    totalItems,
    selectedItems,
    selectedTotalItems,
    selectedSubtotal,
    selectedTotalSavings,
    isAllSelected,
  } = useCart();
  const { theme } = useTheme();

  // Gom nhóm các món trong giỏ theo sản phẩm để hiển thị gọn gàng
  const groupedProducts = React.useMemo(() => {
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

  if (!isCartOpen) return null;

  const themeConfig = {
    green: {
      headerBg: 'bg-gradient-to-r from-[#F0F8EC] via-[#F8FCF5] to-[#F0F8EC] border-[#DCEDCE]',
      iconBg: 'bg-[#78B159]',
      itemCount: 'text-[#456F2F]',
      borderSubtle: 'border-[#DCEDCE]',
      emptyIconBg: 'bg-[#F4F9EE]',
      btnPrimary: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] hover:from-[#629744] hover:to-[#6EA64E] shadow-[#DCEDCE]',
      priceColor: 'text-[#456F2F]',
      variantColor: 'text-[#5E9B3D]',
      qtyBorder: 'border-[#DCEDCE] bg-[#F4F9EE]/60',
      qtyHover: 'hover:text-[#456F2F]',
      footerBg: 'bg-gradient-to-b from-white to-[#F4F9EE] border-[#DCEDCE]',
      btnDelete: 'border-[#DCEDCE] text-stone-500 hover:text-rose-600 hover:bg-rose-50',
    },
    pink: {
      headerBg: 'bg-gradient-to-r from-[#FFF0F5] via-[#FFF6F9] to-[#FFF0F5] border-[#FAD1DE]',
      iconBg: 'bg-[#F0789E]',
      itemCount: 'text-[#9E2B54]',
      borderSubtle: 'border-[#FAD1DE]',
      emptyIconBg: 'bg-[#FFF2F6]',
      btnPrimary: 'bg-gradient-to-r from-[#E0688E] to-[#F0789E] hover:from-[#CF587E] hover:to-[#E0688E] shadow-[#FAD1DE]',
      priceColor: 'text-[#9E2B54]',
      variantColor: 'text-[#E0688E]',
      qtyBorder: 'border-[#FAD1DE] bg-[#FFF2F6]/60',
      qtyHover: 'hover:text-[#9E2B54]',
      footerBg: 'bg-gradient-to-b from-white to-[#FFF2F6] border-[#FAD1DE]',
      btnDelete: 'border-[#FAD1DE] text-stone-500 hover:text-rose-600 hover:bg-rose-50',
    },
    purple: {
      headerBg: 'bg-gradient-to-r from-[#F7F3FF] via-[#FAF7FF] to-[#F7F3FF] border-[#E0D4FA]',
      iconBg: 'bg-[#9C80D8]',
      itemCount: 'text-[#613CA8]',
      borderSubtle: 'border-[#E0D4FA]',
      emptyIconBg: 'bg-[#F8F4FF]',
      btnPrimary: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] hover:from-[#7C5EB8] hover:to-[#8C6EC8] shadow-[#E0D4FA]',
      priceColor: 'text-[#613CA8]',
      variantColor: 'text-[#8C6EC8]',
      qtyBorder: 'border-[#E0D4FA] bg-[#F8F4FF]/60',
      qtyHover: 'hover:text-[#613CA8]',
      footerBg: 'bg-gradient-to-b from-white to-[#F8F4FF] border-[#E0D4FA]',
      btnDelete: 'border-[#E0D4FA] text-stone-500 hover:text-purple-600 hover:bg-purple-50',
    },
    cream: {
      headerBg: 'bg-gradient-to-r from-[#FFF8EC] via-[#FFFAF2] to-[#FFF8EC] border-[#F7E4BE]',
      iconBg: 'bg-[#E5A84B]',
      itemCount: 'text-[#8E5A13]',
      borderSubtle: 'border-[#F7E4BE]',
      emptyIconBg: 'bg-[#FFF9EE]',
      btnPrimary: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] hover:from-[#C7882C] hover:to-[#D6973A] shadow-[#F7E4BE]',
      priceColor: 'text-[#8E5A13]',
      variantColor: 'text-[#D6973A]',
      qtyBorder: 'border-[#F7E4BE] bg-[#FFF9EE]/60',
      qtyHover: 'hover:text-[#8E5A13]',
      footerBg: 'bg-gradient-to-b from-white to-[#FFF9EE] border-[#F7E4BE]',
      btnDelete: 'border-[#F7E4BE] text-stone-500 hover:text-amber-600 hover:bg-amber-50',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className={`w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col rounded-l-3xl overflow-hidden border-l ${curr.borderSubtle}`}>
          
          {/* Header */}
          <div className={`p-4 sm:p-5 ${curr.headerBg} border-b flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${curr.iconBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                🛍️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-800">Giỏ Hàng Omachi</h3>
                <p className={`text-xs ${curr.itemCount} font-bold`}>
                  {totalItems} sản phẩm ({groupedProducts.length} mẫu)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-black/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Select All Action Bar */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer"
                />
                <span>Chọn tất cả ({totalItems} món)</span>
              </label>

              <span className="text-[11px] text-stone-500 font-medium">
                Đã chọn: <strong className="text-rose-600 font-bold">{selectedTotalItems}</strong> món
              </span>
            </div>
          )}

          {/* Cart Items List - Grouped by Product */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className={`w-20 h-20 mx-auto rounded-full ${curr.emptyIconBg} flex items-center justify-center text-3xl shadow-2xs`}>
                  🎀
                </div>
                <h4 className="text-base font-bold text-stone-700">Giỏ hàng của bạn đang trống</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Hãy chọn những mẫu charm hoa, kẹp tóc hay vòng cườm xinh xắn để bắt đầu nhé! ✨
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className={`px-6 py-2.5 rounded-full ${curr.btnPrimary} text-white font-bold text-xs shadow-md transition`}
                >
                  Khám phá sản phẩm ngay
                </button>
              </div>
            ) : (
              groupedProducts.map((group) => (
                <div
                  key={group.product.id}
                  className="bg-stone-50/40 rounded-2xl border border-stone-200/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs transition hover:border-pink-200"
                >
                  {/* Product Group Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={group.isAllSelected}
                        onChange={() => toggleSelectProductGroup(group.product.id, !group.isAllSelected)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer shrink-0"
                        title="Tick chọn tất cả các màu của sản phẩm này"
                      />
                      <img
                        src={group.product.images[0] || '/images/charm_feed_1.jpg'}
                        alt={group.product.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-xl border border-stone-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-stone-800 line-clamp-1">
                          {group.product.name}
                        </h4>
                        <span className="text-[10px] font-bold text-stone-500 bg-white px-1.5 py-0.2 rounded border border-stone-200 inline-block mt-0.5">
                          {group.items.length} màu • Tổng {group.totalQuantity} cái
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* List of Variations within this Product */}
                  <div className="space-y-2 pl-2 sm:pl-3 border-l-2 border-pink-200/70">
                    {group.items.map((item) => {
                      const isChecked = item.selected !== false;

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isChecked
                              ? 'bg-white border-stone-200 shadow-2xs'
                              : 'bg-white/60 border-dashed border-stone-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectItem(item.id)}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer shrink-0"
                              />

                              {item.selectedVariant?.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: item.selectedVariant.colorHex }}
                                />
                              )}

                              <div className="min-w-0">
                                <span className={`text-xs font-extrabold ${isChecked ? 'text-rose-700' : 'text-stone-500'}`}>
                                  {item.selectedVariant ? item.selectedVariant.name : 'Mẫu chuẩn'}
                                </span>
                                {item.customNote && (
                                  <p className="text-[10px] text-stone-400 italic truncate">
                                    Ghi chú: {item.customNote}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-stone-300 hover:text-rose-500 transition p-1 shrink-0"
                              title="Xóa phân loại này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Stepper and Price Row */}
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center border ${curr.qtyBorder} rounded-xl bg-white shadow-2xs overflow-hidden`}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className={`w-7 h-7 flex items-center justify-center text-stone-500 ${curr.qtyHover} cursor-pointer transition shrink-0`}
                                  title="Giảm 1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 1) updateQuantity(item.id, val);
                                  }}
                                  className="w-12 h-7 text-center text-xs font-black text-stone-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className={`w-7 h-7 flex items-center justify-center text-stone-500 ${curr.qtyHover} cursor-pointer transition shrink-0`}
                                  title="Tăng 1"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 10)}
                                className="h-7 px-2 flex items-center justify-center bg-pink-50 hover:bg-pink-100 text-rose-600 border border-pink-200 rounded-lg text-[10px] font-black tracking-tight transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
                                title="Cộng nhanh +10 cái"
                              >
                                +10
                              </button>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-xs font-black ${curr.priceColor}`}>
                                {formatVND(item.totalPrice)}
                              </span>
                              {item.appliedTier && (
                                <span className="block text-[9px] text-emerald-700 font-bold">
                                  {item.appliedTier.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Button */}
          {items.length > 0 && (
            <div className={`p-4 sm:p-5 ${curr.footerBg} border-t space-y-3`}>
              {/* Savings Announcement */}
              {selectedTotalSavings > 0 && (
                <div className="bg-[#F4F9EE] border border-[#DCEDCE] rounded-xl p-2 flex items-center justify-between text-xs text-[#456F2F] font-bold">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tiết kiệm từ giá sỉ:</span>
                  </div>
                  <span className="text-[#3D6329] font-black">-{formatVND(selectedTotalSavings)}</span>
                </div>
              )}

              {/* Subtotal of Selected Items */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 block">Tiền hàng tạm tính:</span>
                  <span className="text-[10px] text-stone-400">
                    (Tính trên {selectedTotalItems} món được chọn)
                  </span>
                </div>
                <span className={`text-xl font-black ${curr.priceColor}`}>{formatVND(selectedSubtotal)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className={`px-3 py-3 rounded-2xl border ${curr.btnDelete} text-xs font-semibold transition`}
                  title="Xóa toàn bộ giỏ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {selectedTotalItems > 0 ? (
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl ${curr.btnPrimary} text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition transform active:scale-98`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tiến hành Đặt Hàng ({selectedTotalItems} món)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    type="button"
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-stone-200 text-stone-400 font-bold text-xs flex items-center justify-center cursor-not-allowed"
                  >
                    Vui lòng chọn ít nhất 1 món để đặt hàng
                  </button>
                )}
              </div>

              <p className="text-[10px] text-center text-stone-400">
                💬 Shop sẽ liên hệ Zalo báo phí ship ưu đãi &amp; gửi ảnh mẫu xác nhận trước khi giao
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
