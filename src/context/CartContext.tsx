'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant, ProductPackageOption } from '@/types';

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
        setItems(normalized);
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
    setItems((prevItems) => {
      const cartItemId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);

      let newQuantity = quantity;
      if (existingIndex > -1) {
        newQuantity = prevItems[existingIndex].quantity + quantity;
      }

      // Clear, straightforward unit price: packageOption price > variant price > product basePrice
      const unitPrice = packageOption?.price ?? variant?.price ?? product.basePrice;

      const updatedItem: CartItem = {
        id: cartItemId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote: customNote || (existingIndex > -1 ? prevItems[existingIndex].customNote : undefined),
        quantity: newQuantity,
        unitPrice,
        totalPrice: unitPrice * newQuantity,
        selected: true, // Auto selected when added
      };

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = updatedItem;
        return next;
      } else {
        return [...prevItems, updatedItem];
      }
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
    const targetId = `${product.id}-${variant?.id || 'default'}-${packageOption?.id || 'standard'}`;
    const unitPrice = packageOption?.price ?? variant?.price ?? product.basePrice;

    setItems((prevItems) => {
      // Chuẩn Shopee: Bỏ chọn các món khác trong giỏ, chỉ tick chọn món bấm Mua Ngay để thanh toán
      const unselectedOthers: CartItem[] = prevItems.map((it) => ({ ...it, selected: false }));
      const existingIndex = unselectedOthers.findIndex((item) => item.id === targetId);

      const targetItem: CartItem = {
        id: targetId,
        product,
        selectedVariant: variant,
        selectedPackage: packageOption,
        customNote,
        quantity: existingIndex > -1 ? unselectedOthers[existingIndex].quantity + quantity : quantity,
        unitPrice,
        totalPrice: unitPrice * (existingIndex > -1 ? unselectedOthers[existingIndex].quantity + quantity : quantity),
        selected: true,
      };

      if (existingIndex > -1) {
        unselectedOthers[existingIndex] = targetItem;
        return unselectedOthers;
      } else {
        return [...unselectedOthers, targetItem];
      }
    });

    setIsCartOpen(false);
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
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
