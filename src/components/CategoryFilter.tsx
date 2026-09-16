'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories?: any[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', icon: '✨' },
  { id: 'cat-1', slug: 'beads-haul', name: 'Charm Vòng', icon: '✨' },
  { id: 'cat-2', slug: 'kep-toc', name: 'Kẹp Tóc', icon: '🎀' },
  { id: 'cat-3', slug: 'vong-tay', name: 'Vòng Tay', icon: '🌸' },
  { id: 'cat-4', slug: 'phone-charm', name: 'Phone Charm', icon: '📱' },
  { id: 'cat-5', slug: 'tui-mu', name: 'Gấu', icon: '🎁' },
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
}: CategoryFilterProps) {
  const { theme } = useTheme();
  const [catList, setCatList] = useState<any[]>(DEFAULT_CATEGORIES);
  const [internalSearch, setInternalSearch] = useState(searchQuery || '');

  useEffect(() => {
    if (searchQuery !== undefined) {
      setInternalSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleSearchEvent = (e: any) => {
      setInternalSearch(e.detail || '');
    };
    window.addEventListener('omachi-search', handleSearchEvent);
    return () => window.removeEventListener('omachi-search', handleSearchEvent);
  }, []);

  const handleSearchInput = (val: string) => {
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
    window.dispatchEvent(new CustomEvent('omachi-search', { detail: val }));
  };

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCatList([{ id: 'all', name: 'Tất cả sản phẩm', icon: '✨' }, ...categories]);
      return;
    }

    fetch('/api/categories')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            icon: c.icon || '🌸',
          }));
          setCatList([{ id: 'all', name: 'Tất cả sản phẩm', icon: '✨' }, ...mapped]);
        }
      })
      .catch(() => {});
  }, [categories]);

  const themeConfig = {
    green: {
      active: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] text-white shadow-md shadow-[#D3E7C6]',
      inactive: 'bg-white/85 text-stone-700 hover:text-[#456F2F] hover:bg-[#F4F9EE] border-[#DCEDCE]',
      searchBorder: 'border-[#DCEDCE]',
      focusRing: 'focus:ring-[#78B159] focus:border-[#78B159]',
    },
    pink: {
      active: 'bg-gradient-to-r from-[#FF7597] to-[#FFA0B4] text-white shadow-md shadow-[#FFE0EA]',
      inactive: 'bg-white/85 text-stone-700 hover:text-[#D84A74] hover:bg-[#FFF0F5] border-[#FFE0EA]',
      searchBorder: 'border-[#FAD1DE]',
      focusRing: 'focus:ring-[#F0789E] focus:border-[#F0789E]',
    },
    purple: {
      active: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] text-white shadow-md shadow-[#E0D4FA]',
      inactive: 'bg-white/85 text-stone-700 hover:text-[#7952C4] hover:bg-[#F8F4FF] border-[#E0D4FA]',
      searchBorder: 'border-[#E0D4FA]',
      focusRing: 'focus:ring-[#9C80D8] focus:border-[#9C80D8]',
    },
    cream: {
      active: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] text-white shadow-md shadow-[#F7E4BE]',
      inactive: 'bg-white/85 text-stone-700 hover:text-[#B56E16] hover:bg-[#FFFBF2] border-[#F7E4BE]',
      searchBorder: 'border-[#F7E4BE]',
      focusRing: 'focus:ring-[#E5A84B] focus:border-[#E5A84B]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className="my-5">
      {/* Header Row with Title, Search Bar in the center, and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3.5 px-1">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-stone-800 tracking-tight font-sans">
            Bộ sưu tập phụ kiện
          </h2>
        </div>

        {/* Thanh tìm kiếm ngay tại trung tâm bộ sưu tập (Vị trí đắc địa) */}
        <div className="flex-1 max-w-full sm:max-w-xs md:max-w-md w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên charm, kẹp nơ, hạt cườm..."
              value={internalSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              className={`w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white/95 backdrop-blur-xs border ${curr.searchBorder} rounded-full shadow-2xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 ${curr.focusRing} focus:bg-white transition`}
            />
            {internalSearch && (
              <button
                type="button"
                onClick={() => handleSearchInput('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700 p-0.5 text-xs font-bold transition cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <span className="text-xs font-semibold text-stone-400 hidden lg:inline shrink-0">
          Lọc nhanh theo danh mục
        </span>
      </div>

      {/* Categories Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {catList.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (cat.slug && selectedCategory === cat.slug);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer select-none backdrop-blur-xs ${
                isSelected
                  ? `${curr.active} border-transparent scale-[1.03]`
                  : `${curr.inactive} shadow-2xs hover:scale-102`
              }`}
            >
              {cat.icon && <span className="text-sm">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
