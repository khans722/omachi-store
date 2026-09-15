'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, ShoppingBag, MessageCircle, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-pink-100 px-3 py-2 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 transition ${
            pathname === '/' ? 'text-rose-600 font-extrabold' : 'text-gray-400 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Trang chủ</span>
        </Link>

        {/* 2. Categories / Charm */}
        <Link
          href="/#categories"
          className="flex flex-col items-center gap-1 p-1 text-gray-400 hover:text-rose-600 transition font-medium"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Bộ sưu tập</span>
        </Link>

        {/* 3. Cart with Badge */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 text-rose-600 font-extrabold group"
        >
          <div className="relative">
            <div className="w-9 h-9 -mt-3 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-3.5 -right-1.5 bg-yellow-300 text-red-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-rose-600">Giỏ hàng</span>
        </button>

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
            pathname === '/tra-cuu-don-hang' ? 'text-rose-600 font-extrabold' : 'text-gray-400 font-medium'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Tra cứu</span>
        </Link>

      </div>
    </div>
  );
}
