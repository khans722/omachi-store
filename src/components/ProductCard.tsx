'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatVND } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Star, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { theme } = useTheme();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.variants?.[0]);
  };

  const themeStyles = {
    green: {
      cardBorder: 'border-white/80 hover:border-[#84C265]/60 hover:shadow-[0_16px_36px_rgba(120,177,89,0.2)]',
      catText: 'text-[#5E9B3D]',
      nameHover: 'group-hover:text-[#3E6B28]',
      priceText: 'text-[#3E6B28]',
      btnBg: 'bg-white/90 hover:bg-gradient-to-r hover:from-[#6EA64E] hover:to-[#78B159] text-[#3E6B28] hover:text-white border border-[#DCEDCE]',
      comboTag: 'bg-white/90 text-[#3E6B28] border-white/80',
    },
    pink: {
      cardBorder: 'border-white/80 hover:border-[#F472B6]/60 hover:shadow-[0_16px_36px_rgba(244,114,182,0.2)]',
      catText: 'text-[#E0688E]',
      nameHover: 'group-hover:text-[#9E2B54]',
      priceText: 'text-[#9E2B54]',
      btnBg: 'bg-white/90 hover:bg-gradient-to-r hover:from-[#E0688E] hover:to-[#F0789E] text-[#9E2B54] hover:text-white border border-[#FAD1DE]',
      comboTag: 'bg-white/90 text-[#9E2B54] border-white/80',
    },
    purple: {
      cardBorder: 'border-white/80 hover:border-[#A855F7]/60 hover:shadow-[0_16px_36px_rgba(168,85,247,0.2)]',
      catText: 'text-[#8C6EC8]',
      nameHover: 'group-hover:text-[#613CA8]',
      priceText: 'text-[#613CA8]',
      btnBg: 'bg-white/90 hover:bg-gradient-to-r hover:from-[#8C6EC8] hover:to-[#9C80D8] text-[#613CA8] hover:text-white border border-[#E0D4FA]',
      comboTag: 'bg-white/90 text-[#613CA8] border-white/80',
    },
    cream: {
      cardBorder: 'border-white/80 hover:border-[#F59E0B]/60 hover:shadow-[0_16px_36px_rgba(245,158,11,0.2)]',
      catText: 'text-[#D6973A]',
      nameHover: 'group-hover:text-[#8E5A13]',
      priceText: 'text-[#8E5A13]',
      btnBg: 'bg-white/90 hover:bg-gradient-to-r hover:from-[#D6973A] hover:to-[#E5A84B] text-[#8E5A13] hover:text-white border border-[#F7E4BE]',
      comboTag: 'bg-white/90 text-[#8E5A13] border-white/80',
    },
  };

  const style = themeStyles[theme] || themeStyles.green;

  return (
    <div className={`group bg-white/80 backdrop-blur-xl rounded-3xl border ${style.cardBorder} shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1.5`}>
      
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-white/40 block">
        <img
          src={product.images[0] || '/images/charm_feed_1.jpg'}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/charm_feed_1.jpg';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
        />
        
        {/* Ambient subtle vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.isHot && (
            <span className="bg-gradient-to-r from-[#FF7043] to-[#FF8A65] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
              🔥 Bán chạy
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-white/95 text-[#3E6B28] border border-white/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-md">
              ✨ Mới về
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-white/60 backdrop-blur-xs">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`${style.catText} font-bold uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[90px]`}>{product.categoryName}</span>
            <div className="flex items-center gap-1 text-amber-400 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-extrabold text-stone-700 text-[10px] sm:text-xs">{product.rating || 5.0}</span>
              <span className="text-[9px] sm:text-[10px] text-stone-400">({product.soldCount || 0})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.id}`}>
            <h3 className={`text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 ${style.nameHover} transition leading-snug min-h-[32px] sm:min-h-[38px]`}>
              {product.name}
            </h3>
          </Link>

          {/* Stock status indicator */}
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px]">
            {product.stock !== undefined && product.stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50/80 px-1.5 py-0.2 rounded-md border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Kho: <strong className="font-extrabold">{product.stock.toLocaleString('vi-VN')}</strong></span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-100">
                <span>Tạm hết</span>
              </span>
            )}
            {product.variants && product.variants.length > 0 && (
              <span className="text-stone-400">({product.variants.length} màu)</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100/80 flex items-center justify-between gap-1">
          <div>
            <div className={`text-xs sm:text-base font-black ${style.priceText}`}>
              {formatVND(product.basePrice)}
              <span className="text-[9px] sm:text-[10px] text-stone-400 font-normal ml-0.5">/cái</span>
            </div>
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <div className="text-[9px] sm:text-[10px] text-stone-400 line-through">
                {formatVND(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl ${style.btnBg} transition-all duration-200 flex items-center justify-center active:scale-90 shadow-2xs shrink-0`}
            title="Thêm vào giỏ"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
