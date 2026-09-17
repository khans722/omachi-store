'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { formatVND, calculateSmartUnitPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { flyToCart } from '@/lib/flyToCart';
import { X, Check, ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QuickSelectModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSelectModal({ product, isOpen, onClose }: QuickSelectModalProps) {
  const router = useRouter();
  const { addItem, buyNow, setIsCartOpen } = useCart();
  const { theme } = useTheme();
  const previewImgRef = useRef<HTMLImageElement>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
      setQuantity(1);
      setErrorMsg('');
    }
  }, [isOpen, product]);

  const smartPricing = useMemo(() => {
    return calculateSmartUnitPrice(product.basePrice, quantity, product.comboTiers);
  }, [product.basePrice, quantity, product.comboTiers]);

  if (!isOpen) return null;

  const unitPrice = selectedVariant?.price ?? smartPricing.unitPrice;
  const totalPrice = unitPrice * quantity;

  // Stock calculations
  const availableStock =
    selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock || 999;

  // Display Image (Variant image if available, else product image)
  const displayImage =
    selectedVariant?.imageUrl ||
    selectedVariant?.image ||
    product.images?.[0] ||
    '/uploads/charm_1789432914386_1789371730804_1528911961217344.jpg';

  const themeStyles = {
    green: {
      activeRing: 'border-[#569440] text-[#3E6B28] bg-[#F2FAF0]',
      activeBadge: 'bg-[#569440] text-white',
      btnPrimary: 'bg-gradient-to-r from-[#569440] to-[#6EA64E] hover:from-[#467E33] hover:to-[#569440] text-white shadow-[#569440]/20',
      btnSecondary: 'border border-[#569440] text-[#3E6B28] bg-[#F2FAF0] hover:bg-[#E5F5E0]',
      priceText: 'text-[#4A8537]',
    },
    pink: {
      activeRing: 'border-[#FF6B8B] text-[#D84A74] bg-[#FFF0F5]',
      activeBadge: 'bg-[#FF6B8B] text-white',
      btnPrimary: 'bg-gradient-to-r from-[#FF6B8B] to-[#FF8EAA] hover:from-[#E84878] hover:to-[#FF6B8B] text-white shadow-[#FF6B8B]/20',
      btnSecondary: 'border border-[#FF6B8B] text-[#D84A74] bg-[#FFF0F5] hover:bg-[#FFE0EB]',
      priceText: 'text-[#9E2B54]',
    },
    purple: {
      activeRing: 'border-[#A855F7] text-[#613CA8] bg-[#FAF5FF]',
      activeBadge: 'bg-[#A855F7] text-white',
      btnPrimary: 'bg-gradient-to-r from-[#8C6EC8] to-[#A855F7] hover:from-[#7859B5] hover:to-[#8C6EC8] text-white shadow-[#A855F7]/20',
      btnSecondary: 'border border-[#A855F7] text-[#613CA8] bg-[#FAF5FF] hover:bg-[#F3E8FF]',
      priceText: 'text-[#613CA8]',
    },
    cream: {
      activeRing: 'border-[#F59E0B] text-[#8E5A13] bg-[#FEF3C7]',
      activeBadge: 'bg-[#F59E0B] text-white',
      btnPrimary: 'bg-gradient-to-r from-[#D6973A] to-[#F59E0B] hover:from-[#BC7F26] hover:to-[#D6973A] text-white shadow-[#F59E0B]/20',
      btnSecondary: 'border border-[#F59E0B] text-[#8E5A13] bg-[#FEF3C7] hover:bg-[#FDE68A]',
      priceText: 'text-[#8E5A13]',
    },
  };

  const style = themeStyles[theme] || themeStyles.green;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setErrorMsg('Vui lòng chọn màu sắc/phân loại nhé!');
      return;
    }
    if (availableStock <= 0) {
      setErrorMsg('Mẫu này tạm thời hết hàng!');
      return;
    }

    // Hiệu ứng ảnh sản phẩm bay uốn lượn vào giỏ hàng
    flyToCart(previewImgRef.current || (e?.currentTarget as HTMLElement), displayImage);

    addItem(product, quantity, selectedVariant, undefined, undefined, false);
    onClose();
  };

  const handleBuyNow = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setErrorMsg('Vui lòng chọn màu sắc/phân loại nhé!');
      return;
    }
    if (availableStock <= 0) {
      setErrorMsg('Mẫu này tạm thời hết hàng!');
      return;
    }
    // Chuẩn Shopee: Bỏ chọn các món khác trong giỏ, chỉ mua đúng món này và đi tới checkout
    buyNow(product, quantity, selectedVariant, undefined, undefined);
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Sheet / Dialog Content */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Product Preview like Shopee */}
        <div className="p-4 border-b border-stone-100 flex items-start gap-3.5 bg-stone-50/50">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-stone-200 bg-white shrink-0 shadow-xs">
            <img
              ref={previewImgRef}
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/uploads/charm_1789432914386_1789371730804_1528911961217344.jpg';
              }}
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 leading-snug">
              {product.name}
            </h4>

            {/* Dynamic Price (1688 wholesale) */}
            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              <span className={`text-base sm:text-xl font-black ${style.priceText}`}>
                {formatVND(unitPrice)}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium">/cái</span>
              {smartPricing.appliedTier && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  ⚡ {smartPricing.appliedTier.label}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-1 text-[11px] text-stone-500 flex items-center gap-1.5">
              <span>Kho:</span>
              <span className={`font-bold ${availableStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {availableStock > 0 ? `${availableStock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Scrollable options */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Warning/Error Msg */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* 1. Color / Variant selection */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Màu sắc / Phân loại
                </span>
                {selectedVariant && (
                  <span className="text-xs font-semibold text-stone-500">
                    Đã chọn: <strong className="text-stone-800">{selectedVariant.name}</strong>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOutOfStock = (v.stock ?? 0) <= 0;

                  return (
                    <button
                      key={v.id}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedVariant(v);
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                        isOutOfStock
                          ? 'opacity-40 border-dashed border-stone-200 bg-stone-50 cursor-not-allowed text-stone-400 line-through'
                          : isSelected
                          ? `${style.activeRing} ring-2 ring-offset-1`
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{v.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Wholesale Tier Buttons */}
          {product.comboTiers && product.comboTiers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Bảng Giá Sỉ Theo Số Lượng
                </span>
                <span className="text-[10px] text-stone-400">
                  {smartPricing.appliedTier ? `Đã áp dụng: ${smartPricing.appliedTier.label}` : 'Mua nhiều tự động giảm'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.comboTiers.map((tier) => {
                  const isActive = quantity >= tier.minQuantity;
                  const savingsPerUnit = Math.max(0, product.basePrice - tier.unitPrice);
                  const discountPercent = product.basePrice > 0 ? Math.round((savingsPerUnit / product.basePrice) * 100) : 0;

                  return (
                    <button
                      key={tier.minQuantity}
                      type="button"
                      onClick={() => setQuantity(tier.minQuantity)}
                      className={`p-2 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
                        isActive
                          ? `${style.activeRing} ring-2 ring-offset-1 font-bold shadow-xs`
                          : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-extrabold truncate">{tier.label}</span>
                        {discountPercent > 0 && (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 rounded">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-black mt-1 ${style.priceText}`}>
                        {formatVND(tier.unitPrice)}
                        <span className="text-[9px] font-normal text-stone-400">/c</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Quantity Stepper */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Số lượng mua
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Tổng: <strong className="text-stone-700 font-bold">{quantity} cái</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 font-extrabold flex items-center justify-center hover:bg-stone-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white shadow-2xs text-base transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      setQuantity(Math.min(val, availableStock || 999));
                    }
                  }}
                  className="w-12 text-center text-xs font-black bg-transparent text-stone-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 999, q + 1))}
                  disabled={quantity >= availableStock}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 font-extrabold flex items-center justify-center hover:bg-stone-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white shadow-2xs text-base transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-stone-400 font-semibold">Chọn nhanh:</span>
              {[1, 10, 50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    quantity === preset
                      ? `${style.activeBadge}`
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset} cái
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions: Shopee 2-button row */}
        <div className="p-4 bg-white border-t border-stone-100 space-y-2">
          {/* Subtotal preview */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-stone-500 font-medium">Tạm tính:</span>
            <span className={`text-base font-black ${style.priceText}`}>
              {formatVND(totalPrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={(e) => handleAddToCart(e)}
              className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 ${style.btnSecondary}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Thêm vào giỏ</span>
            </button>

            <button
              onClick={handleBuyNow}
              className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${style.btnPrimary}`}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Mua ngay</span>
            </button>
          </div>

          {/* Link to view full product details */}
          <div className="text-center pt-1">
            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-stone-700 transition"
            >
              <span>Xem chi tiết đầy đủ sản phẩm & đánh giá</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
