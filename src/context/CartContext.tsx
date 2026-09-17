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
  // 1. Tính tổng số lượng của từng mã sản phẩm trong giỏ (gộp tất cả các màu)
  const productTotalQuantities: Record<string, number> = {};
  for (const item of cartItems) {
    if (item.product.comboTiers && item.product.comboTiers.length > 0) {
      const pId = item.product.id;
      productTotalQuantities[pId] = (productTotalQuantities[pId] || 0) + item.quantity;
    }
  }

  // 2. Tự động cập nhật đơn giá theo mốc sỉ của tổng số lượng đó
  return cartItems.map((item) => {
    if (item.product.comboTiers && item.product.comboTiers.length > 0) {
      const totalQty = productTotalQuantities[item.product.id] || item.quantity;
      const smart = calculateSmartUnitPrice(
        item.product.basePrice,
        totalQty,
        item.product.comboTiers
      );

      // Nếu có chênh lệch giá do packageOption / variant đặc biệt (so với basePrice) thì giữ phần phụ thu
      const variantExtra = Math.max(0, (item.selectedPackage?.price ?? item.selectedVariant?.price ?? item.product.basePrice) - item.product.basePrice);
      const finalUnitPrice = smart.unitPrice + variantExtra;

      return {
        ...item,
        unitPrice: finalUnitPrice,
        appliedTier: smart.appliedTier,
        totalPrice: finalUnitPrice * item.quantity,
      };
    }
    return item;
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
          ? parsed.map((it: CartItem) => ({
              ...it,
              selected: it.selected !== undefined ? it.selected : true,
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
    const minQty = Math.max(1, Number(product.minOrderQuantity) || 1);
    const stepQty = Math.max(1, Number(product.stepQuantity) || 1);
    let validQuantity = Math.max(minQty, quantity);
    if (validQuantity > minQty && (validQuantity - minQty) % stepQty !== 0) {
      validQuantity = minQty + Math.ceil((validQuantity - minQty) / stepQty) * stepQty;
    }

    setItems((prevItems) => {
      const cartItemId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);

      let newQuantity = validQuantity;
      if (existingIndex > -1) {
        newQuantity = prevItems[existingIndex].quantity + validQuantity;
      }

      const rawItem: CartItem = {
        id: cartItemId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote: customNote || (existingIndex > -1 ? prevItems[existingIndex].customNote : undefined),
        quantity: newQuantity,
        unitPrice: packageOption?.price ?? variant?.price ?? product.basePrice,
        appliedTier: undefined,
        totalPrice: (packageOption?.price ?? variant?.price ?? product.basePrice) * newQuantity,
        selected: true,
      };

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...prevItems];
        newItems[existingIndex] = rawItem;
      } else {
        newItems = [...prevItems, rawItem];
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
    const minQty = Math.max(1, Number(product.minOrderQuantity) || 1);
    const stepQty = Math.max(1, Number(product.stepQuantity) || 1);
    let validQuantity = Math.max(minQty, quantity);
    if (validQuantity > minQty && (validQuantity - minQty) % stepQty !== 0) {
      validQuantity = minQty + Math.ceil((validQuantity - minQty) / stepQty) * stepQty;
    }

    const targetId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;

    setItems((prevItems) => {
      // Chuẩn Shopee: Bỏ chọn các món khác trong giỏ, chỉ tick chọn món bấm Mua Ngay để thanh toán
      const unselectedOthers: CartItem[] = prevItems.map((it) => ({ ...it, selected: false }));
      const existingIndex = unselectedOthers.findIndex((item) => item.id === targetId);
      const totalQty = existingIndex > -1 ? unselectedOthers[existingIndex].quantity + validQuantity : validQuantity;

      const targetItem: CartItem = {
        id: targetId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote,
        quantity: totalQty,
        unitPrice: packageOption?.price ?? variant?.price ?? product.basePrice,
        appliedTier: undefined,
        totalPrice: (packageOption?.price ?? variant?.price ?? product.basePrice) * totalQty,
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
      const updated = prevItems.map((item) => {
        if (item.id === cartItemId) {
          const minQty = Math.max(1, Number(item.product.minOrderQuantity) || 1);
          const clampedQty = Math.max(minQty, newQuantity);
          return {
            ...item,
            quantity: clampedQty,
            totalPrice: item.unitPrice * clampedQty,
          };
        }
        return item;
      });
      return applyWholesalePricing(updated);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => applyWholesalePricing(prev.filter((item) => item.id !== cartItemId)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleSelectItem = (cartItemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const toggleSelectProductGroup = (productId: string, selected: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, selected } : item
      )
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total savings compared to base single item price
  const totalSavings = items.reduce((sum, item) => {
    const originalPrice = item.product.basePrice * item.quantity;
    return sum + Math.max(0, originalPrice - item.totalPrice);
  }, 0);

  // Selected items calculations
  const selectedItems = items.filter((it) => it.selected !== false);
  const selectedTotalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const selectedTotalSavings = selectedItems.reduce((sum, item) => {
    const originalPrice = item.product.basePrice * item.quantity;
    return sum + Math.max(0, originalPrice - item.totalPrice);
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
