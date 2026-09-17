'use client';

import React, { useState, useEffect } from 'react';
import { Instagram, Sparkles, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface HeroBannerProps {
  settings?: ShopSettings;
}

export default function HeroBanner({ settings }: HeroBannerProps) {
  const { theme } = useTheme();

  // Multi-image list
  const imagesList = React.useMemo(() => {
    if (settings?.heroImages && settings.heroImages.length > 0) {
      return settings.heroImages.filter(Boolean);
    }
    return [
      '/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg',
      '/uploads/charm_1789442857187_1789435799272_1528911961217344.jpg',
      '/uploads/charm_1789442857200_1789435799294_1528911961217344.jpg',
      '/uploads/charm_1789442857210_1789435799313_1528911961217344.jpg',
      '/uploads/charm_1789442857219_1789435799334_1528911961217344.jpg'
    ];
  }, [settings?.heroImages, settings?.heroImage]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Auto-play slideshow every 5 seconds if multiple images exist
  useEffect(() => {
    if (imagesList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % imagesList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imagesList.length]);

  const title = settings?.heroTitle || 'Vòng Charm, Kẹp Tóc & Phụ Kiện Pastel';
  const subtitle = settings?.heroSubtitle || 'Khám phá thế giới charm trong veo, kẹp hoa kem bơ và phụ kiện handmade được tuyển chọn & thiết kế thủ công ngọt ngào ♡';
  const slogan = settings?.slogan || 'Tiệm Phụ Kiện Thủ Công Omachi';

  const themeConfig = {
    green: {
      cardBg: 'bg-white/90 border-[#D4EAC9] shadow-[0_14px_36px_rgba(86,148,64,0.10)]',
      tagBg: 'bg-[#F2FAF0] text-[#3E6B28] border-[#D1EAC7]',
      titleLine1: 'text-[#2D5A1E]',
      titleLine2: 'text-transparent bg-clip-text bg-gradient-to-r from-[#4FA832] via-[#2EB875] to-[#E5A817]',
      socialBtn: 'border-[#DCEDCE] hover:border-[#67A852] text-[#4A5D43] hover:text-[#386D27] bg-white',
      imgBadge: 'bg-[#4FA832] text-white',
      thumbActive: 'border-[#4FA832]',
    },
    pink: {
      cardBg: 'bg-white/90 border-[#FFD6E4] shadow-[0_14px_36px_rgba(255,117,151,0.12)]',
      tagBg: 'bg-[#FFF0F5] text-[#D84A74] border-[#FFD0DE]',
      titleLine1: 'text-[#B82255]',
      titleLine2: 'text-transparent bg-clip-text bg-gradient-to-r from-[#E83E76] via-[#F472B6] to-[#FB923C]',
      socialBtn: 'border-[#FFE0EA] hover:border-[#FF7597] text-[#634850] hover:text-[#D84A74] bg-white',
      imgBadge: 'bg-[#FF6B8B] text-white',
      thumbActive: 'border-[#FF6B8B]',
    },
    purple: {
      cardBg: 'bg-white/90 border-[#E6D8FD] shadow-[0_14px_36px_rgba(155,124,227,0.12)]',
      tagBg: 'bg-[#F8F4FF] text-[#6839BE] border-[#DFD1FC]',
      titleLine1: 'text-[#5829A8]',
      titleLine2: 'text-transparent bg-clip-text bg-gradient-to-r from-[#7C4DFF] via-[#A855F7] to-[#EC4899]',
      socialBtn: 'border-[#EBE0FE] hover:border-[#9B7CE3] text-[#554665] hover:text-[#7952C4] bg-white',
      imgBadge: 'bg-[#8E6ADF] text-white',
      thumbActive: 'border-[#8E6ADF]',
    },
    cream: {
      cardBg: 'bg-white/90 border-[#FBE5BD] shadow-[0_14px_36px_rgba(229,149,48,0.12)]',
      tagBg: 'bg-[#FFFBF2] text-[#A66008] border-[#FCE1B4]',
      titleLine1: 'text-[#8E4D00]',
      titleLine2: 'text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#EC4899]',
      socialBtn: 'border-[#FCEBCC] hover:border-[#E59530] text-[#63533E] hover:text-[#B56E16] bg-white',
      imgBadge: 'bg-[#E59530] text-white',
      thumbActive: 'border-[#E59530]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-[32px] ${curr.cardBg} border p-3.5 sm:p-7 lg:p-8 my-1.5 sm:my-4 transition-all duration-300 backdrop-blur-md`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
        
        {/* Left column: Text */}
        <div className="lg:col-span-7 space-y-2 sm:space-y-3.5">
          {/* Slogan Pill */}
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full ${curr.tagBg} border text-[10px] sm:text-xs font-bold tracking-wide shadow-xs max-w-full`}>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate max-w-[250px] sm:max-w-none">{slogan}</span>
            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 fill-rose-400 shrink-0" />
          </div>

          {/* Chubby Bubble Pastel Main Heading */}
          <h1 className="font-bubble text-3xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.2] tracking-normal select-none">
            {title.includes('&') ? (
              <>
                <span className={`block ${curr.titleLine1} drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]`}>
                  {title.split('&')[0].trim()}
                </span>
                <span className={`inline-block mt-1 ${curr.titleLine2} drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]`}>
                  &amp; {title.split('&')[1].trim()}
                </span>
                <span className="inline-block ml-2 text-2xl sm:text-4xl animate-bounce-slow">✨</span>
              </>
            ) : (
              <span className={curr.titleLine1}>{title}</span>
            )}
          </h1>

          <p className="text-[11px] sm:text-sm text-[#66544E] max-w-lg leading-snug sm:leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
            {subtitle}
          </p>

          {/* Social Links - Compact Side-by-Side on Mobile */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-0.5">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border ${curr.socialBtn} text-[10px] sm:text-xs font-bold shadow-xs transition hover:scale-105`}
              >
                <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                <span>Instagram: {settings.instagramHandle || '@omachii18'}</span>
              </a>
            )}

            {settings?.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border ${curr.socialBtn} text-[10px] sm:text-xs font-bold shadow-xs transition hover:scale-105`}
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-stone-800" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.888 2.896 2.896 0 0 1-2.888-2.888 2.896 2.896 0 0 1 2.888-2.888c.328 0 .641.056.936.155V9.424a6.31 6.31 0 0 0-.936-.071C6.012 9.353 3.2 12.165 3.2 15.651 3.2 19.137 6.012 22 9.498 22c3.486 0 6.309-2.863 6.309-6.349V9.11a8.21 8.21 0 0 0 3.782.923v-3.347z"/>
                </svg>
                <span>TikTok: {settings.tiktokHandle || '@jiji.omachistore'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right column: Cute Polaroid Lookbook Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm lg:max-w-none space-y-2 sm:space-y-3">
            <div className="relative aspect-[16/9] sm:aspect-[4/3] rounded-xl sm:rounded-[24px] overflow-hidden shadow-xs sm:shadow-md border-2 sm:border-4 border-white bg-white group/banner">
              <img
                key={activeImgIndex}
                src={imagesList[activeImgIndex] || '/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg'}
                alt="Omachi Handmade Charm"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg';
                }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/banner:scale-105"
              />

              {/* Cute overlay badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-between p-2.5 sm:p-3.5 pointer-events-none">
                <span className={`text-[10px] sm:text-[11px] font-bold ${curr.imgBadge} px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1`}>
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{settings?.heroBadge || 'Ảnh thật tại tiệm 100%'}</span>
                </span>

                {imagesList.length > 1 && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                    {activeImgIndex + 1} / {imagesList.length}
                  </span>
                )}
              </div>

              {/* Navigation Arrows for Slideshow */}
              {imagesList.length > 1 && (
                <div className="absolute inset-y-0 inset-x-1.5 sm:inset-x-2 flex items-center justify-between opacity-80 sm:opacity-0 group-hover/banner:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs sm:shadow-md transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev + 1) % imagesList.length)}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs sm:shadow-md transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Ảnh kế tiếp"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}

              {/* Dots indicator */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 sm:gap-1.5 z-10 pointer-events-auto">
                  {imagesList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveImgIndex(dotIdx)}
                      className={`h-1 sm:h-1.5 rounded-full transition-all ${
                        activeImgIndex === dotIdx ? 'w-4 sm:w-5 bg-white shadow-xs' : 'w-1 sm:w-1.5 bg-white/60 hover:bg-white/90'
                      }`}
                      title={`Xem ảnh ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Hidden on mobile to save space, shown on sm+) */}
            {imagesList.length > 1 && (
              <div className="hidden sm:flex items-center justify-center gap-2 overflow-x-auto py-0.5">
                {imagesList.map((thumbUrl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => setActiveImgIndex(tIdx)}
                    className={`relative w-12 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIndex === tIdx
                        ? `${curr.thumbActive} scale-105 shadow-xs`
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumb ${tIdx}`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
