'use client';

import React from 'react';
import { ComboTier } from '@/types';
import { calculateSmartUnitPrice, formatVND } from '@/lib/utils';
import { Sparkles, TrendingDown, Gift, Zap } from 'lucide-react';

interface SmartPricingBarProps {
  basePrice: number;
  quantity: number;
  comboTiers?: ComboTier[];
  onQuantityChange: (qty: number) => void;
}

export default function SmartPricingBar({
  basePrice,
  quantity,
  comboTiers,
  onQuantityChange,
}: SmartPricingBarProps) {
  if (!comboTiers || comboTiers.length === 0) return null;

  const { unitPrice, appliedTier, nextTier, itemsToNextTier, savings, discountPercent } =
    calculateSmartUnitPrice(basePrice, quantity, comboTiers);

  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-yellow-50 rounded-2xl p-4 border border-pink-200/80 space-y-3">
      
      {/* Header with Title & Applied Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>Bảng Giá Combo Tự Động (Mua nhiều giảm sâu):</span>
        </div>

        {appliedTier ? (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm animate-pulse">
            <Zap className="w-3 h-3" />
            <span>Đã áp dụng: {appliedTier.label}</span>
          </span>
        ) : (
          <span className="text-[11px] text-pink-600 font-semibold bg-pink-100/80 px-2 py-0.5 rounded-full">
            Đang tính giá lẻ
          </span>
        )}
      </div>

      {/* Quick Select Buttons (50 pcs, 100 pcs, 200 pcs...) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {comboTiers.map((tier) => {
          const isActive = quantity >= tier.minQuantity;
          const savingsPerUnit = basePrice > 0 ? Math.max(0, basePrice - tier.unitPrice) : 0;
          const realDiscount = (basePrice > 0 && savingsPerUnit > 0)
            ? Math.round((savingsPerUnit / basePrice) * 100)
            : 0;

          // Làm sạch badge nếu badge cũ có chữ "Tiết kiệm 25%" nhưng thực tế không giảm
          let displayBadge = tier.badge;
          if (savingsPerUnit === 0 && displayBadge && displayBadge.includes('Tiết kiệm')) {
            displayBadge = 'Mốc sỉ ' + tier.minQuantity + ' cái';
          } else if (savingsPerUnit > 0 && (!displayBadge || displayBadge.includes('Tiết kiệm'))) {
            displayBadge = `Tiết kiệm ${formatVND(savingsPerUnit)}/c`;
          }

          return (
            <button
              key={tier.minQuantity}
              type="button"
              onClick={() => onQuantityChange(tier.minQuantity)}
              className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-pink-500 shadow-md ring-2 ring-pink-300'
                  : 'bg-white/60 border-pink-100 hover:border-pink-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-gray-800 truncate">{tier.label}</span>
                {realDiscount > 0 && (
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md shrink-0 border border-rose-200/60">
                    -{realDiscount}%
                  </span>
                )}
              </div>
              <p className="text-xs font-black text-pink-600 mt-1">
                {formatVND(tier.unitPrice)}
                <span className="text-[10px] text-gray-400 font-normal">/cái</span>
              </p>
              {displayBadge && (
                <p className="text-[9px] text-gray-500 font-medium truncate mt-0.5">{displayBadge}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Upsell Alert / Next Tier Progress */}
      {nextTier ? (
        <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-pink-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-pink-800">
            <Gift className="w-4 h-4 text-pink-500 flex-shrink-0" />
            <span>
              Thêm <strong>{itemsToNextTier} cái</strong> nữa để tự động nhận <strong>{nextTier.label}</strong> ({formatVND(nextTier.unitPrice)}/cái)!
            </span>
          </div>
          <button
            type="button"
            onClick={() => onQuantityChange(nextTier.minQuantity)}
            className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline flex-shrink-0 ml-2"
          >
            Lên mốc {nextTier.minQuantity}
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded-xl flex items-center gap-1.5 font-medium">
          <span>👑 Bạn đang nhận mức giá sỉ ưu đãi cao nhất của xưởng Omachi!</span>
        </div>
      )}

      {/* Current Calculation Summary */}
      <div className="flex items-center justify-between pt-1 text-xs text-gray-700">
        <div>
          <span>Đơn giá áp dụng: </span>
          <strong className="text-pink-600 font-extrabold text-sm">{formatVND(unitPrice)}</strong>
          <span className="text-gray-400 text-[11px]"> x {quantity} cái</span>
        </div>
        {savings > 0 && (
          <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Tiết kiệm {formatVND(savings)}</span>
          </div>
        )}
      </div>

    </div>
  );
}
