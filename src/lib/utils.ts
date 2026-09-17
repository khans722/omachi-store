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

/**
 * Tính cước vận chuyển chuẩn theo Cân Nặng (gram / kg) và Giá Trị Đơn Hàng (COD):
 * - Đơn dưới 3.000.000đ:
 *   + < 1kg: 15.000đ
 *   + 1kg - 2kg (VD: 1.5kg): 17.000đ
 *   + 2kg - 3kg: 21.000đ
 *   + 3kg - 4kg: 25.000đ
 *   + 4kg - 5kg: 29.000đ
 *   + > 5kg: 29.000đ + (mỗi kg tiếp theo + 4.000đ)
 * - Đơn từ 3.000.000đ trở lên (gồm phí bảo hiểm khai giá COD hàng giá trị cao):
 *   + < 1kg: 39.000đ
 *   + 1kg - 2kg (VD: 1.5kg): 42.000đ
 *   + 2kg - 3kg: 46.000đ
 *   + 3kg - 4kg: 50.000đ
 *   + 4kg - 5kg: 54.000đ
 *   + > 5kg: 54.000đ + (mỗi kg tiếp theo + 4.000đ)
 */
export function calculateShippingFee(
  totalWeightGram: number,
  orderTotalAmount: number
): {
  shippingFee: number;
  weightKg: number;
  isHighValueOrder: boolean;
  tierLabel: string;
} {
  const weightKg = Math.max(0.01, Number(totalWeightGram || 0) / 1000);
  const isHighValueOrder = (Number(orderTotalAmount) || 0) >= 3000000;

  let shippingFee = 0;
  let tierLabel = '';

  if (!isHighValueOrder) {
    // Thu COD dưới 3 triệu
    if (weightKg <= 1.0) {
      shippingFee = 15000;
      tierLabel = 'Dưới 1kg (15k)';
    } else if (weightKg <= 2.0) {
      shippingFee = 17000;
      tierLabel = '1kg - 2kg (17k)';
    } else if (weightKg <= 3.0) {
      shippingFee = 21000;
      tierLabel = '2kg - 3kg (21k)';
    } else if (weightKg <= 4.0) {
      shippingFee = 25000;
      tierLabel = '3kg - 4kg (25k)';
    } else if (weightKg <= 5.0) {
      shippingFee = 29000;
      tierLabel = '4kg - 5kg (29k)';
    } else {
      const extraKg = Math.ceil(weightKg - 5.0);
      shippingFee = 29000 + extraKg * 4000;
      tierLabel = `Trên 5kg (+${extraKg * 4}k)`;
    }
  } else {
    // Thu COD từ 3 triệu trở lên
    if (weightKg <= 1.0) {
      shippingFee = 39000;
      tierLabel = 'Dưới 1kg (39k)';
    } else if (weightKg <= 2.0) {
      shippingFee = 42000;
      tierLabel = '1kg - 2kg (42k)';
    } else if (weightKg <= 3.0) {
      shippingFee = 46000;
      tierLabel = '2kg - 3kg (46k)';
    } else if (weightKg <= 4.0) {
      shippingFee = 50000;
      tierLabel = '3kg - 4kg (50k)';
    } else if (weightKg <= 5.0) {
      shippingFee = 54000;
      tierLabel = '4kg - 5kg (54k)';
    } else {
      const extraKg = Math.ceil(weightKg - 5.0);
      shippingFee = 54000 + extraKg * 4000;
      tierLabel = `Trên 5kg (+${extraKg * 4}k)`;
    }
  }

  return {
    shippingFee,
    weightKg: Math.round(weightKg * 100) / 100,
    isHighValueOrder,
    tierLabel,
  };
}
