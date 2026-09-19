'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatVND } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Star } from 'lucide-react';
import QuickSelectModal from '@/components/QuickSelectModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const { theme } = useTheme();
  const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);

  const handleOpenQuickSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickSelectOpen(true);
  };

  const themeConfig = {
    green: {
      btnAction: 'bg-[#F2FAF0] hover:bg-[#569440] text-[#3E6B28] hover:text-white border-[#D1EAC7]',
      accentText: 'text-[#3A6B29]',
    },
    pink: {
      btnAction: 'bg-[#FFF0F5] hover:bg-[#FF6B8B] text-[#D84A74] hover:text-white border-[#FFD0DE]',
      accentText: 'text-[#9E2B54]',
    },
    purple: {
      btnAction: 'bg-[#F8F4FF] hover:bg-[#8E6ADF] text-[#7952C4] hover:text-white border-[#E0D4FA]',
      accentText: 'text-[#613CA8]',
    },
    cream: {
      btnAction: 'bg-[#FFFBF2] hover:bg-[#E59530] text-[#B56E16] hover:text-white border-[#FCE1B4]',
      accentText: 'text-[#8E5A13]',
    },
  };

  const style = themeConfig[theme] || themeConfig.green;
  const [imgError, setImgError] = useState(false);
  const images = Array.isArray(product?.images) ? product.images : [];
  const hasValidImage = Boolean(images.length > 0 && images[0]) && !imgError;
  const primaryImage = images[0] || '';
  const secondaryImage = images[1] || primaryImage;
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const tiers = Array.isArray(product?.comboTiers) ? product.comboTiers : [];

  return (
    <>
      <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1">
        
        {/* Product Image Box with smooth hover */}
        <Link href={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-stone-100 block">
          {hasValidImage ? (
            <>
              {/* Primary image */}
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
              />

              {/* Secondary image fade on hover if available */}
              {images.length > 1 && (
                <img
                  src={secondaryImage}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-pink-50/30 text-stone-400 p-4 select-none">
              <div className="w-14 h-14 rounded-2xl bg-white/80 border border-pink-100/60 flex items-center justify-center text-2xl mb-1.5 shadow-2xs">
                🌸
              </div>
              <span className="text-[11px] font-medium text-stone-400">Chưa có ảnh</span>
            </div>
          )}

          {/* Minimalist Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start pointer-events-none">
            {product.isHot && (
              <span className="bg-stone-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                HOT
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                NEW
              </span>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-white">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
              <span className="text-stone-400 font-semibold tracking-wider uppercase truncate max-w-[100px]">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-stone-700 text-[11px] font-extrabold">{product.rating || 5.0}</span>
                <span className="text-stone-400 text-[10px]">({product.soldCount || 0})</span>
              </div>
            </div>

            {/* Product Name - Uniform height without text clipping */}
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-stone-600 transition-colors duration-200 line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.75rem]">
                {product.name}
              </h3>
            </Link>

            {/* Stock / Variant hint */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-stone-500">
              {variants.length > 0 && (
                <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                  {variants.length} màu
                </span>
              )}
              {product.stock !== undefined && product.stock > 0 ? (
                <span className="text-emerald-700 font-medium">
                  • Còn hàng
                </span>
              ) : (
                <span className="text-rose-500 font-medium">
                  • Tạm hết
                </span>
              )}
            </div>
          </div>

          {/* Price & Quick Add Action - Anchored and Responsive */}
          <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-1.5 mt-auto">
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="text-xs sm:text-base font-extrabold text-stone-900 leading-tight truncate">
                {formatVND(product.basePrice)}
                <span className="text-[10px] text-stone-400 font-normal ml-0.5">/cái</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                {tiers.length > 0 ? (
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold truncate">
                    ⚡ Sỉ từ {formatVND(Math.min(...tiers.map((t) => Number(t?.unitPrice || product.basePrice || 0))))}
                  </span>
                ) : product.originalPrice && product.originalPrice > product.basePrice ? (
                  <span className="text-[9px] sm:text-[10px] text-stone-400 line-through leading-tight truncate">
                    {formatVND(product.originalPrice)}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenQuickSelect}
              className={`w-8 h-8 sm:w-auto sm:h-9 px-0 sm:px-3 rounded-full border ${style.btnAction || 'bg-rose-50 text-rose-600 border-rose-200'} font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-2xs shrink-0 cursor-pointer`}
              title="Chọn phân loại & Mua hàng"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-xs">Chọn mua</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shopee-style Quick Select Modal */}
      {isQuickSelectOpen && (
        <QuickSelectModal
          product={product}
          isOpen={isQuickSelectOpen}
          onClose={() => setIsQuickSelectOpen(false)}
        />
      )}
    </>
  );
});

export default ProductCard;
