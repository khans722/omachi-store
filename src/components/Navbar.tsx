'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Package, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomer } from '@/context/CustomerContext';
import OmachiLogo from '@/components/OmachiLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { theme } = useTheme();
  const { customer, openAuthModal, logout } = useCustomer();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerText, setBannerText] = useState('Tiệm Phụ Kiện Handmade Omachi • Nhận xâu vòng tay, kẹp tóc & charm pastel theo yêu cầu ✨');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.bannerText) {
          setBannerText(res.data.bannerText);
        }
      })
      .catch(() => {});
  }, []);

  const headerAccentMap = {
    green: {
      bar: 'bg-[#F2F9EF]/95 text-[#355E22] border-b border-[#D8ECCE]/80',
      searchBg: 'bg-white/80 border-[#D3E7C6] focus:ring-[#78B159]/50 placeholder:text-[#8AA878]',
      searchIcon: 'text-[#78B159]',
      orderBtn: 'text-[#3E6B28] bg-white/85 hover:bg-white border-[#D3E7C6]',
      cartBtn: 'bg-gradient-to-r from-[#72AA55] to-[#3DBE87] hover:from-[#629744] hover:to-[#28B47E] shadow-[#D3E7C6]',
      cartBadge: 'bg-[#FFF59D] text-[#335322]',
    },
    pink: {
      bar: 'bg-[#FFF0F6]/95 text-[#91224A] border-b border-[#FCDCE8]/80',
      searchBg: 'bg-white/80 border-[#FAD1DE] focus:ring-[#F472B6]/50 placeholder:text-[#D18FA6]',
      searchIcon: 'text-[#F472B6]',
      orderBtn: 'text-[#9E2B54] bg-white/85 hover:bg-white border-[#FAD1DE]',
      cartBtn: 'bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#E0529A] shadow-[#FAD1DE]',
      cartBadge: 'bg-[#FFF59D] text-[#7A1E3C]',
    },
    purple: {
      bar: 'bg-[#F8F5FF]/95 text-[#582E9E] border-b border-[#E8DEF8]/80',
      searchBg: 'bg-white/80 border-[#E0D4FA] focus:ring-[#A855F7]/50 placeholder:text-[#AA98D4]',
      searchIcon: 'text-[#A855F7]',
      orderBtn: 'text-[#613CA8] bg-white/85 hover:bg-white border-[#E0D4FA]',
      cartBtn: 'bg-gradient-to-r from-[#9333EA] to-[#A855F7] hover:from-[#7E22CE] hover:to-[#9333EA] shadow-[#E0D4FA]',
      cartBadge: 'bg-[#FFF59D] text-[#4F2D8E]',
    },
    cream: {
      bar: 'bg-[#FFFBF0]/95 text-[#7E4C0E] border-b border-[#FCEECF]/80',
      searchBg: 'bg-white/80 border-[#F7E4BE] focus:ring-[#F59E0B]/50 placeholder:text-[#C7A87A]',
      searchIcon: 'text-[#F59E0B]',
      orderBtn: 'text-[#8E5A13] bg-white/85 hover:bg-white border-[#F7E4BE]',
      cartBtn: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] shadow-[#F7E4BE]',
      cartBadge: 'bg-[#FFF59D] text-[#70440C]',
    },
  };

  const curr = headerAccentMap[theme] || headerAccentMap.green;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Announcement Bar - Soft Pastel Luxury Boutique */}
      <div className={`${curr.bar} py-1 px-4 text-center text-[11px] sm:text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-colors duration-300 backdrop-blur-md`}>
        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse shrink-0" />
        <span className="truncate">{bannerText}</span>
        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0 transform group-hover:scale-102 transition">
            <OmachiLogo size="md" />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm vòng charm, kẹp tóc hoa, combo cườm sỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm ${curr.searchBg} border rounded-full focus:outline-none focus:ring-2 focus:bg-white text-stone-700 transition backdrop-blur-md`}
              />
              <Search className={`w-4 h-4 ${curr.searchIcon} absolute left-3.5 top-1/2 -translate-y-1/2`} />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <ThemeSwitcher />

            {/* Order Lookup Link - Ẩn trên mobile vì đã có ở thanh điều hướng đáy */}
            <Link
              href="/tra-cuu-don-hang"
              className={`hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold ${curr.orderBtn} rounded-full border transition shadow-2xs backdrop-blur-md`}
              title="Tra cứu hành trình đơn hàng bằng Số điện thoại hoặc Mã đơn"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Tra cứu đơn</span>
            </Link>

            {/* Customer Account Button / Dropdown */}
            {!customer ? (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 hover:text-rose-600 bg-white/85 hover:bg-white rounded-full border border-pink-100 transition shadow-2xs backdrop-blur-md cursor-pointer"
                title="Đăng nhập / Đăng ký tài khoản"
              >
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline">Đăng nhập</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-gray-800 bg-pink-50/90 hover:bg-pink-100/90 rounded-full border border-pink-200 transition shadow-2xs backdrop-blur-md cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white text-[10px] font-black flex items-center justify-center">
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="hidden md:inline max-w-[90px] truncate">{customer.fullName?.split(' ').pop() || 'Tài khoản'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 animate-fade-in text-xs">
                    <div className="px-3.5 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-800 truncate">{customer.fullName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{customer.phone}</p>
                    </div>

                    <Link
                      href="/tra-cuu-don-hang"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 hover:bg-pink-50 text-gray-700 font-bold flex items-center gap-2 transition"
                    >
                      <Package className="w-3.5 h-3.5 text-pink-500" />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 transition border-t border-gray-100 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 ${curr.cartBtn} text-white rounded-full shadow-md text-xs font-bold transition transform active:scale-95`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className={`min-w-[20px] h-5 px-1.5 ${curr.cartBadge} font-black text-[10px] rounded-full flex items-center justify-center shadow-xs shrink-0`}>{totalItems > 99 ? "99+" : totalItems}</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
