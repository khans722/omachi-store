'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: any[];
}

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', icon: '✨' },
  { id: 'beads-haul', name: 'Hạt Cườm & Beads', icon: '💎' },
  { id: 'kep-toc', name: 'Kẹp Tóc Nàng Thơ', icon: '🌸' },
  { id: 'vong-tay', name: 'Vòng Tay Cườm', icon: '🎀' },
  { id: 'phone-charm', name: 'Phone Charm & Thẻ', icon: '📱' },
  { id: 'tui-mu', name: 'Túi Mù May Mắn', icon: '🎁' },
];

export default function CategoryFilter({ selectedCategory, onSelectCategory, categories }: CategoryFilterProps) {
  const { theme } = useTheme();
  const [catList, setCatList] = useState<any[]>(DEFAULT_CATEGORIES);

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
            id: c.slug || c.id,
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
      active: 'bg-[#3A6B29] text-white shadow-sm',
      hover: 'hover:border-[#3A6B29] hover:text-[#3A6B29]',
    },
    pink: {
      active: 'bg-[#9E2B54] text-white shadow-sm',
      hover: 'hover:border-[#9E2B54] hover:text-[#9E2B54]',
    },
    purple: {
      active: 'bg-[#613CA8] text-white shadow-sm',
      hover: 'hover:border-[#613CA8] hover:text-[#613CA8]',
    },
    cream: {
      active: 'bg-[#8E5A13] text-white shadow-sm',
      hover: 'hover:border-[#8E5A13] hover:text-[#8E5A13]',
    },
  };

  const style = themeConfig[theme] || themeConfig.green;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>Bộ sưu tập phụ kiện</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
        </div>
        <span className="text-xs font-medium text-stone-400 hidden sm:inline">
          Lọc nhanh theo danh mục
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {catList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 border cursor-pointer select-none ${
                isSelected
                  ? `${style.active} border-transparent scale-[1.02]`
                  : `bg-white text-stone-700 border-stone-200/80 shadow-2xs ${style.hover} hover:bg-stone-50`
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
