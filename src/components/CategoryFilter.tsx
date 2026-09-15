'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';

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

  const activePillMap = {
    green: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] text-white border-transparent shadow-md shadow-[#D3E7C6]',
    pink: 'bg-gradient-to-r from-[#E0688E] to-[#F0789E] text-white border-transparent shadow-md shadow-[#FAD1DE]',
    purple: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] text-white border-transparent shadow-md shadow-[#E0D4FA]',
    cream: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] text-white border-transparent shadow-md shadow-[#F7E4BE]',
  };

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <h2 className="text-base sm:text-lg font-black text-stone-800 tracking-tight">
            Khám Phá Danh Mục Charm
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#5E9B3D] hidden sm:inline">
          Bấm để lọc theo bộ sưu tập
        </span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        {catList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border ${
                isSelected
                  ? `${activePillMap[theme] || activePillMap.green} scale-102`
                  : 'bg-white text-stone-600 border-[#DCEDCE] hover:border-[#78B159] hover:bg-[#F4F9EE]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
