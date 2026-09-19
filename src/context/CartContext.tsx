'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant, ProductPackageOption } from '@/types';
import { calculateSmartUnitPrice } from '@/lib/utils';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant,
    customNote?: string,
    packageOption?: ProductPackageOption,
    openDrawer?: boolean
  ) => void;
  buyNow: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant,
    customNote?: string,
    packageOption?: ProductPackageOption
  ) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  toggleSelectItem: (cartItemId: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  toggleSelectProductGroup: (productId: string, selected: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  totalSavings: number;
  selectedItems: CartItem[];
  selectedTotalItems: number;
  selectedSubtotal: number;
  selectedTotalSavings: number;
  isAllSelected: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * 1688 Wholesale Auto-Tier Pricing:
 * Gom tổng số lượng của TẤT CẢ các phân loại màu / gói phụ kiện của CÙNG 1 MÃ SẢN PHẨM (product.id)
 * để tính mốc giá sỉ bậc thang tốt nhất cho toàn bộ các màu đó!
 */
function applyWholesalePricing(cartItems: CartItem[]): CartItem[] {
  if (!Array.isArray(cartItems)) return [];
  
  // 1. Tính tổng số lượng của từng mã sản phẩm trong giỏ (gộp tất cả các màu)
  const productTotalQuantities: Record<string, number> = {};
  for (const item of cartItems) {
    if (!item || !item.product) continue;
    if (Array.isArray(item.product.comboTiers) && item.product.comboTiers.length > 0) {
      const pId = String(item.product.id);
      productTotalQuantities[pId] = (productTotalQuantities[pId] || 0) + (Number(item.quantity) || 1);
    }
  }

  // 2. Tự động cập nhật đơn giá theo mốc sỉ của tổng số lượng đó
  return cartItems
    .filter((item) => item && item.product && item.id)
    .map((item) => {
      const basePrice = Number(item.product.basePrice) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);

      if (Array.isArray(item.product.comboTiers) && item.product.comboTiers.length > 0) {
        const totalQty = productTotalQuantities[String(item.product.id)] || qty;
        const smart = calculateSmartUnitPrice(
          basePrice,
          totalQty,
          item.product.comboTiers
        );

        const variantExtra = Math.max(
          0,
          (Number(item.selectedPackage?.price ?? item.selectedVariant?.price ?? basePrice) || basePrice) - basePrice
        );
        const finalUnitPrice = (Number(smart.unitPrice) || basePrice) + variantExtra;

        return {
          ...item,
          quantity: qty,
          unitPrice: finalUnitPrice,
          appliedTier: smart.appliedTier,
          totalPrice: finalUnitPrice * qty,
        };
      }

      const itemUnitPrice = Number(item.selectedPackage?.price ?? item.selectedVariant?.price ?? item.unitPrice ?? basePrice) || basePrice;
      return {
        ...item,
        quantity: qty,
        unitPrice: itemUnitPrice,
        totalPrice: itemUnitPrice * qty,
      };
    });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on client side
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omachii_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure every item has selected property (default true)
        const normalized = Array.isArray(parsed)
          ? parsed
              .filter((it) => it && it.product && typeof it.product === 'object' && it.id)
              .map((it: CartItem) => ({
                ...it,
                quantity: Math.max(1, Number(it.quantity) || 1),
                selected: it.selected !== false,
              }))
          : [];
        // Tự động đồng bộ lại giá sỉ theo tổng số lượng các màu
        setItems(applyWholesalePricing(normalized));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('omachii_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isHydrated]);

  const addItem = (
    product: Product,
    quantity = 1,
    variant?: ProductVariant,
    customNote?: string,
    packageOption?: ProductPackageOption,
    openDrawer = false
  ) => {
    if (!product || !product.id) return;

    const minQty = Math.max(1, Number(product.minOrderQuantity) || 1);
    const stepQty = Math.max(1, Number(product.stepQuantity) || 1);
    let validQuantity = Math.max(minQty, Number(quantity) || 1);
    if (validQuantity > minQty && (validQuantity - minQty) % stepQty !== 0) {
      validQuantity = minQty + Math.ceil((validQuantity - minQty) / stepQty) * stepQty;
    }

    setItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      const cartItemId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;
      const existingIndex = safePrev.findIndex((item) => item?.id === cartItemId);

      let newQuantity = validQuantity;
      if (existingIndex > -1 && safePrev[existingIndex]) {
        newQuantity = (Number(safePrev[existingIndex].quantity) || 0) + validQuantity;
      }

      const basePrice = Number(product.basePrice) || 0;
      const unitPrice = Number(packageOption?.price ?? variant?.price ?? basePrice) || basePrice;

      const rawItem: CartItem = {
        id: cartItemId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote: customNote || (existingIndex > -1 ? safePrev[existingIndex]?.customNote : undefined),
        quantity: newQuantity,
        unitPrice: unitPrice,
        appliedTier: undefined,
        totalPrice: unitPrice * newQuantity,
        selected: true,
      };

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...safePrev];
        newItems[existingIndex] = rawItem;
      } else {
        newItems = [...safePrev, rawItem];
      }

      // Chuẩn sàn 1688: Tự động gom tất cả các màu để tính mốc giá sỉ chung
      return applyWholesalePricing(newItems);
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const buyNow = (
    product: Product,
    quantity = 1,
    variant?: ProductVariant,
    customNote?: string,
    packageOption?: ProductPackageOption
  ) => {
    if (!product || !product.id) return;

    const minQty = Math.max(1, Number(product.minOrderQuantity) || 1);
    const stepQty = Math.max(1, Number(product.stepQuantity) || 1);
    let validQuantity = Math.max(minQty, Number(quantity) || 1);
    if (validQuantity > minQty && (validQuantity - minQty) % stepQty !== 0) {
      validQuantity = minQty + Math.ceil((validQuantity - minQty) / stepQty) * stepQty;
    }

    const targetId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;

    setItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      // Chuẩn Shopee: Bỏ chọn các món khác trong giỏ, chỉ tick chọn món bấm Mua Ngay để thanh toán
      const unselectedOthers: CartItem[] = safePrev.map((it) => ({ ...it, selected: false }));
      const existingIndex = unselectedOthers.findIndex((item) => item?.id === targetId);
      const totalQty = existingIndex > -1 ? (Number(unselectedOthers[existingIndex].quantity) || 0) + validQuantity : validQuantity;

      const basePrice = Number(product.basePrice) || 0;
      const unitPrice = Number(packageOption?.price ?? variant?.price ?? basePrice) || basePrice;

      const targetItem: CartItem = {
        id: targetId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote,
        quantity: totalQty,
        unitPrice: unitPrice,
        appliedTier: undefined,
        totalPrice: unitPrice * totalQty,
        selected: true,
      };

      let nextItems: CartItem[];
      if (existingIndex > -1) {
        nextItems = [...unselectedOthers];
        nextItems[existingIndex] = targetItem;
      } else {
        nextItems = [...unselectedOthers, targetItem];
      }

      return applyWholesalePricing(nextItems);
    });

    setIsCartOpen(false);
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      const updated = safePrev.map((item) => {
        if (item?.id === cartItemId && item?.product) {
          const minQty = Math.max(1, Number(item.product.minOrderQuantity) || 1);
          const clampedQty = Math.max(minQty, Number(newQuantity) || 1);
          return {
            ...item,
            quantity: clampedQty,
            totalPrice: (Number(item.unitPrice) || 0) * clampedQty,
          };
        }
        return item;
      });
      return applyWholesalePricing(updated);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return applyWholesalePricing(safePrev.filter((item) => item?.id !== cartItemId));
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleSelectItem = (cartItemId: string) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((item) =>
        item?.id === cartItemId ? { ...item, selected: !item.selected } : item
      );
    });
  };

  const toggleSelectAll = (selected: boolean) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((item) => ({ ...item, selected }));
    });
  };

  const toggleSelectProductGroup = (productId: string, selected: boolean) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((item) =>
        item?.product?.id === productId ? { ...item, selected } : item
      );
    });
  };

  const totalItems = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item?.totalPrice) || 0), 0);
  
  // Calculate total savings compared to base single item price
  const totalSavings = items.reduce((sum, item) => {
    const basePrice = Number(item?.product?.basePrice) || 0;
    const qty = Number(item?.quantity) || 0;
    const originalPrice = basePrice * qty;
    return sum + Math.max(0, originalPrice - (Number(item?.totalPrice) || 0));
  }, 0);

  // Selected items calculations
  const selectedItems = items.filter((it) => it && it.selected !== false);
  const selectedTotalItems = selectedItems.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (Number(item?.totalPrice) || 0), 0);
  const selectedTotalSavings = selectedItems.reduce((sum, item) => {
    const basePrice = Number(item?.product?.basePrice) || 0;
    const qty = Number(item?.quantity) || 0;
    const originalPrice = basePrice * qty;
    return sum + Math.max(0, originalPrice - (Number(item?.totalPrice) || 0));
  }, 0);

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        buyNow,
        updateQuantity,
        removeItem,
        clearCart,
        toggleSelectItem,
        toggleSelectAll,
        toggleSelectProductGroup,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        totalSavings,
        selectedItems,
        selectedTotalItems,
        selectedSubtotal,
        selectedTotalSavings,
        isAllSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
