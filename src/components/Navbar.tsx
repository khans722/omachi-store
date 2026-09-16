'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerText, setBannerText] = useState('Tiệm Phụ Kiện Handmade Omachi • Nhận xâu vòng tay, kẹp tóc & charm pastel theo yêu cầu ✨');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchTerm(q);
    }

    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.bannerText) {
          setBannerText(res.data.bannerText);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('omachi-search', { detail: val }));
    }
  };

  const handleSearchSubmit = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const headerAccentMap = {
    green: {
      bar: 'bg-[#F2FAF0] text-[#3E6B28] border-b border-[#D8ECCE]/80',
      searchBg: 'bg-stone-100/80 border-stone-200 focus:border-[#2D6A24] focus:bg-white placeholder:text-stone-400',
      searchIcon: 'text-stone-400',
      orderBtn: 'text-stone-700 bg-white hover:bg-stone-50 border-stone-200 hover:text-[#2E5A1C]',
      cartBtn: 'bg-[#569440] hover:bg-[#467E33] text-white shadow-xs',
      cartBadge: 'bg-white text-[#2D6A24] shadow-xs',
    },
    pink: {
      bar: 'bg-[#FFF0F5] text-[#D84A74] border-b border-[#FFD0DE]/80',
      searchBg: 'bg-stone-100/80 border-stone-200 focus:border-[#DB2777] focus:bg-white placeholder:text-stone-400',
      searchIcon: 'text-stone-400',
      orderBtn: 'text-stone-700 bg-white hover:bg-stone-50 border-stone-200 hover:text-[#9E2B54]',
      cartBtn: 'bg-[#FF6B8B] hover:bg-[#F25577] text-white shadow-xs',
      cartBadge: 'bg-white text-[#DB2777] shadow-xs',
    },
    purple: {
      bar: 'bg-[#F8F5FF] text-[#613CA8] border-b border-[#E8DEF8]/70',
      searchBg: 'bg-stone-100/80 border-stone-200 focus:border-[#7E22CE] focus:bg-white placeholder:text-stone-400',
      searchIcon: 'text-stone-400',
      orderBtn: 'text-stone-700 bg-white hover:bg-stone-50 border-stone-200 hover:text-[#613CA8]',
      cartBtn: 'bg-[#7E22CE] hover:bg-[#6B21A8] text-white shadow-stone-200',
      cartBadge: 'bg-white text-[#7E22CE] shadow-xs',
    },
    cream: {
      bar: 'bg-[#FFFBF0] text-[#8E5A13] border-b border-[#FCEECF]/70',
      searchBg: 'bg-stone-100/80 border-stone-200 focus:border-[#B45309] focus:bg-white placeholder:text-stone-400',
      searchIcon: 'text-stone-400',
      orderBtn: 'text-stone-700 bg-white hover:bg-stone-50 border-stone-200 hover:text-[#8E5A13]',
      cartBtn: 'bg-[#B45309] hover:bg-[#92400E] text-white shadow-stone-200',
      cartBadge: 'bg-white text-[#B45309] shadow-xs',
    },
  };

  const curr = headerAccentMap[theme] || headerAccentMap.green;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      {/* Top Announcement Bar - Soft Boutique */}
      <div className={`${curr.bar} py-1.5 px-4 text-center text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-colors duration-300`}>
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
        <span className="truncate">{bannerText}</span>
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0 transform group-hover:scale-102 transition">
            <OmachiLogo size="md" />
          </Link>

          {/* Desktop Search Bar - Cùng độ rộng và căn chỉnh đồng trục với ô tìm kiếm bộ sưu tập */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative w-full"
            >
              <input
                type="text"
                placeholder="Tìm theo tên charm, kẹp nơ, hạt cườm..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full h-10 pl-10 pr-8 text-xs sm:text-sm ${curr.searchBg} border rounded-full focus:outline-none focus:ring-1 focus:bg-white text-stone-800 transition`}
              />
              <Search className={`w-4 h-4 ${curr.searchIcon} absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none`} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto justify-end">
            {/* Order Lookup Link - Luôn hiển thị trên cả điện thoại và máy tính */}
            <Link
              href="/tra-cuu-don-hang"
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold sm:font-medium ${curr.orderBtn} rounded-full border transition shadow-2xs shrink-0`}
              title="Tra cứu hành trình đơn hàng"
            >
              <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] sm:text-xs">Tra cứu</span>
            </Link>

            <ThemeSwitcher />

            {/* Customer Account Button / Dropdown */}
            {!customer ? (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 rounded-full border border-stone-200 transition shadow-2xs cursor-pointer"
                title="Đăng nhập / Đăng ký tài khoản"
              >
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">Đăng nhập</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-full border border-stone-200 transition shadow-2xs cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="hidden md:inline max-w-[90px] truncate">{customer.fullName?.split(' ').pop() || 'Tài khoản'}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in text-xs">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{customer.fullName}</p>
                      <p className="text-[11px] text-stone-400 font-mono">{customer.phone}</p>
                    </div>

                    <Link
                      href="/tra-cuu-don-hang"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2 transition"
                    >
                      <Package className="w-3.5 h-3.5 text-stone-500" />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 transition border-t border-stone-100 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button - Shopee Full Screen Page */}
            <Link
              href="/cart"
              id="navbar-cart-btn"
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 ${curr.cartBtn} rounded-full shadow-sm text-xs font-semibold transition transform active:scale-95 cursor-pointer`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className={`min-w-[20px] h-5 px-1.5 ${curr.cartBadge} font-bold text-[10px] rounded-full flex items-center justify-center shrink-0`}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>

        {/* Mobile Search Bar - Tìm kiếm mặt hàng trên điện thoại */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="relative w-full"
          >
            <input
              type="text"
              placeholder="🔍 Tìm vòng charm, kẹp tóc hoa, phụ kiện..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 text-xs ${curr.searchBg} border rounded-full focus:outline-none focus:ring-1 focus:bg-white text-stone-800 transition shadow-2xs font-medium`}
            />
            <Search className={`w-3.5 h-3.5 ${curr.searchIcon} absolute left-3 top-1/2 -translate-y-1/2`} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}
