'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, ShoppingBag, MessageCircle, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { theme } = useTheme();

  const themeConfig = {
    green: {
      activeText: 'text-[#456F2F] font-extrabold',
      cartBg: 'bg-gradient-to-tr from-[#6EA64E] via-[#78B159] to-[#84C265] shadow-md shadow-[#DCEDCE]',
      cartBadge: 'bg-[#FFF59D] text-[#31521F]',
      cartText: 'text-[#456F2F]',
      hoverText: 'hover:text-[#456F2F]',
    },
    pink: {
      activeText: 'text-[#9E2B54] font-extrabold',
      cartBg: 'bg-gradient-to-tr from-[#E0688E] via-[#F0789E] to-[#F472B6] shadow-md shadow-[#FAD1DE]',
      cartBadge: 'bg-[#FFF59D] text-[#7A1E3C]',
      cartText: 'text-[#9E2B54]',
      hoverText: 'hover:text-[#9E2B54]',
    },
    purple: {
      activeText: 'text-[#613CA8] font-extrabold',
      cartBg: 'bg-gradient-to-tr from-[#8C6EC8] via-[#9C80D8] to-[#A855F7] shadow-md shadow-[#E0D4FA]',
      cartBadge: 'bg-[#FFF59D] text-[#4F2D8E]',
      cartText: 'text-[#613CA8]',
      hoverText: 'hover:text-[#613CA8]',
    },
    cream: {
      activeText: 'text-[#8E5A13] font-extrabold',
      cartBg: 'bg-gradient-to-tr from-[#D6973A] via-[#E5A84B] to-[#F59E0B] shadow-md shadow-[#F7E4BE]',
      cartBadge: 'bg-[#FFF59D] text-[#70440C]',
      cartText: 'text-[#8E5A13]',
      hoverText: 'hover:text-[#8E5A13]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  // Ẩn thanh điều hướng chung khi ở trang Chi tiết sản phẩm (đã có thanh mua hàng Shopee riêng),
  // trang Giỏ hàng (/cart có thanh thanh toán riêng), trang Đặt hàng (checkout), trang Admin và trang Đơn hàng chi tiết
  if (
    pathname.startsWith('/cart') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/order/')
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-pink-100 px-3 py-2 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 transition ${
            pathname === '/' ? curr.activeText : 'text-gray-400 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Trang chủ</span>
        </Link>

        {/* 2. Categories / Charm */}
        <Link
          href="/#categories"
          className={`flex flex-col items-center gap-1 p-1 text-gray-400 ${curr.hoverText} transition font-medium`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Bộ sưu tập</span>
        </Link>

        {/* 3. Cart with Badge & Fly Target ID */}
        <Link
          href="/cart"
          id="bottom-cart-btn"
          className={`relative flex flex-col items-center gap-1 p-1 ${curr.cartText} font-extrabold group`}
        >
          <div className="relative">
            <div className={`w-9 h-9 -mt-3 rounded-full ${curr.cartBg} text-white flex items-center justify-center`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            {totalItems > 0 && (
              <span className={`absolute -top-3.5 -right-1.5 ${curr.cartBadge} font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs`}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-black ${curr.cartText}`}>Giỏ hàng</span>
        </Link>

        {/* 4. Chat Zalo with Shop */}
        <a
          href="https://zalo.me/0375408256"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 p-1 text-blue-600 font-bold transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chat Zalo</span>
        </a>

        {/* 5. Order Tracking */}
        <Link
          href="/tra-cuu-don-hang"
          className={`flex flex-col items-center gap-1 p-1 transition ${
            pathname === '/tra-cuu-don-hang' ? curr.activeText : 'text-gray-400 font-medium'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Tra cứu</span>
        </Link>

      </div>
    </div>
  );
}
