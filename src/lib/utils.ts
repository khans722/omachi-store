import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ComboTier } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount).replace('₫', 'đ');
}

/**
 * Smart tier calculation:
 * Finds the highest applicable tier for quantity, calculates unit price and savings.
 */
export function calculateSmartUnitPrice(
  basePrice: number,
  quantity: number,
  comboTiers?: ComboTier[]
): {
  unitPrice: number;
  appliedTier?: ComboTier;
  nextTier?: ComboTier;
  itemsToNextTier: number;
  savings: number;
  discountPercent: number;
} {
  if (!comboTiers || comboTiers.length === 0) {
    return {
      unitPrice: basePrice,
      itemsToNextTier: 0,
      savings: 0,
      discountPercent: 0,
    };
  }

  // Sort tiers ascending by minQuantity
  const sorted = [...comboTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  let appliedTier: ComboTier | undefined;
  let nextTier: ComboTier | undefined;

  for (let i = 0; i < sorted.length; i++) {
    if (quantity >= sorted[i].minQuantity) {
      appliedTier = sorted[i];
    } else if (!nextTier) {
      nextTier = sorted[i];
    }
  }

  const unitPrice = appliedTier ? appliedTier.unitPrice : basePrice;
  const originalTotal = basePrice * quantity;
  const actualTotal = unitPrice * quantity;
  const savings = Math.max(0, originalTotal - actualTotal);
  const discountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
  const itemsToNextTier = nextTier ? nextTier.minQuantity - quantity : 0;

  return {
    unitPrice,
    appliedTier,
    nextTier,
    itemsToNextTier,
    savings,
    discountPercent,
  };
}
