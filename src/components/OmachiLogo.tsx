'use client';

import React from 'react';

interface OmachiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function OmachiLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
}: OmachiLogoProps) {
  const config = {
    sm: {
      bearH: 52,
      titleH: 30,
      gap: 'gap-2.5',
    },
    md: {
      bearH: 68,
      titleH: 38,
      gap: 'gap-3.5',
    },
    lg: {
      bearH: 84,
      titleH: 48,
      gap: 'gap-4',
    },
    xl: {
      bearH: 104,
      titleH: 58,
      gap: 'gap-5',
    },
  };

  const curr = config[size] || config.md;

  return (
    <div className={`inline-flex items-center select-none ${curr.gap} ${className} group`}>
      
      {/* 1. Bên Trái: Bé Gấu cầm ô lá sen HD sắc nét, cử động nhún nhảy */}
      <div className="relative flex-shrink-0 animate-mascot-bob">
        <img
          src="/images/omachi_bear_hd.png"
          alt="Omachi Bear Mascot"
          className="h-11 sm:h-[64px] w-auto object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* 2. Bên Phải: Chữ OMACHI HD vẽ tay chuẩn 100% gốc */}
      <div className="flex flex-col justify-center">
        <img
          src="/images/omachi_text_clean_hd.png"
          alt="OMACHI"
          className="h-6 sm:h-[36px] w-auto object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-102"
        />

        {/* Subtitle Badge - Ẩn trên mobile để header không bị chật chội */}
        {showSubtitle && (
          <div className="hidden sm:flex items-center gap-1.5 mt-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#3E6B28] bg-[#F4F9EE] px-2.5 py-0.5 rounded-full border border-[#DCEDCE] shadow-2xs">
              Handmade Studio ✨
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
