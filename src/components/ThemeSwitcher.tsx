'use client';

import React, { useState } from 'react';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { Check, Sparkles } from 'lucide-react';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  icon: string;
  colors: string[];
  gradient: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'green',
    name: 'Xanh Matcha',
    icon: '🌿',
    colors: ['#78B159', '#FBBF24', '#FB7185', '#34D399'],
    gradient: 'linear-gradient(135deg, #78B159, #FBBF24, #FB7185, #34D399)',
    description: 'Matcha • Vàng Nắng • Đào Mơ • Bạc Hà',
  },
  {
    id: 'pink',
    name: 'Hồng Dâu',
    icon: '🌸',
    colors: ['#F472B6', '#FB923C', '#C084FC', '#FDE047'],
    gradient: 'linear-gradient(135deg, #F472B6, #FB923C, #C084FC, #FDE047)',
    description: 'Thạch Anh • Cam Hoàng Hôn • Lavender • Vàng Kem',
  },
  {
    id: 'purple',
    name: 'Tím Lavender',
    icon: '💜',
    colors: ['#A855F7', '#6366F1', '#EC4899', '#38BDF8'],
    gradient: 'linear-gradient(135deg, #A855F7, #6366F1, #EC4899, #38BDF8)',
    description: 'Tím Mộng Mơ • Indigo • Magenta • Cyan',
  },
  {
    id: 'cream',
    name: 'Vàng Kem Bơ',
    icon: '🧈',
    colors: ['#F59E0B', '#FB923C', '#FDE68A', '#F43F5E'],
    gradient: 'linear-gradient(135deg, #F59E0B, #FB923C, #FDE68A, #F43F5E)',
    description: 'Mật Ong • Cam Đào • Champagne • Hổ Phách Hồng',
  },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 hover:border-stone-300 text-stone-700 text-xs font-bold shadow-2xs transition transform active:scale-95 backdrop-blur-md"
        title="Chọn dải lụa màu nền phát sáng"
      >
        <span
          className="w-4 h-4 rounded-full shadow-2xs border border-black/10 shrink-0"
          style={{ background: currentTheme.gradient }}
        />
        <span className="hidden sm:inline">
          {currentTheme.icon} {currentTheme.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
            <div className="px-2.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Dải Lụa Phát Sáng (Silk Wave)</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium">4 Tone Pastel</span>
            </div>

            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-stone-100/90 text-stone-900 shadow-2xs'
                      : 'hover:bg-stone-50/80 text-stone-600'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{opt.icon}</span>
                      <span className="text-xs font-black">{opt.name}</span>
                      {isSelected && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    
                    {/* 4-Color Mini Silk Ribbon Swatch */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div
                        className="h-2 w-28 rounded-full shadow-2xs border border-black/10"
                        style={{ background: opt.gradient }}
                      />
                    </div>

                    <p className="text-[10px] text-stone-400 line-clamp-1">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
