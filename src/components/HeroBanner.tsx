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
    if (settings?.heroImage) {
      return [settings.heroImage];
    }
    return ['/images/charm_feed_1.jpg'];
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
      cardBg: 'bg-[#F6FAF3]/90 border-[#DDEFD7] shadow-[0_12px_32px_rgba(103,168,82,0.10)]',
      tagBg: 'bg-white text-[#4D853A] border-[#D1EAC7]',
      titleAccent: 'text-[#569440]',
      socialBtn: 'border-[#DCEDCE] hover:border-[#67A852] text-[#4A5D43] hover:text-[#386D27] bg-white',
      imgBadge: 'bg-[#569440] text-white',
      thumbActive: 'border-[#569440]',
    },
    pink: {
      cardBg: 'bg-[#FFF5F8]/90 border-[#FFE0EA] shadow-[0_12px_32px_rgba(255,117,151,0.12)]',
      tagBg: 'bg-white text-[#D84A74] border-[#FFD0DE]',
      titleAccent: 'text-[#E84878]',
      socialBtn: 'border-[#FFE0EA] hover:border-[#FF7597] text-[#634850] hover:text-[#D84A74] bg-white',
      imgBadge: 'bg-[#E84878] text-white',
      thumbActive: 'border-[#E84878]',
    },
    purple: {
      cardBg: 'bg-[#F9F5FF]/90 border-[#EBE0FE] shadow-[0_12px_32px_rgba(155,124,227,0.10)]',
      tagBg: 'bg-white text-[#7952C4] border-[#DFD1FC]',
      titleAccent: 'text-[#845BCF]',
      socialBtn: 'border-[#EBE0FE] hover:border-[#9B7CE3] text-[#554665] hover:text-[#7952C4] bg-white',
      imgBadge: 'bg-[#845BCF] text-white',
      thumbActive: 'border-[#845BCF]',
    },
    cream: {
      cardBg: 'bg-[#FFFBF2]/90 border-[#FCEBCC] shadow-[0_12px_32px_rgba(229,149,48,0.10)]',
      tagBg: 'bg-white text-[#B56E16] border-[#FCE1B4]',
      titleAccent: 'text-[#CC7D1A]',
      socialBtn: 'border-[#FCEBCC] hover:border-[#E59530] text-[#63533E] hover:text-[#B56E16] bg-white',
      imgBadge: 'bg-[#CC7D1A] text-white',
      thumbActive: 'border-[#CC7D1A]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className={`relative overflow-hidden rounded-[32px] ${curr.cardBg} border p-5 sm:p-10 my-3 sm:my-5 transition-all duration-300 backdrop-blur-md`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
        
        {/* Left column: Text */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${curr.tagBg} border text-xs font-bold tracking-wide shadow-xs`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{slogan}</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#382B27] leading-[1.3] tracking-tight">
            {title.includes('&') ? (
              <>
                <span>{title.split('&')[0].trim()}</span>
                <br />
                <span className={`${curr.titleAccent} font-extrabold`}>
                  &amp; {title.split('&')[1].trim()}
                </span>
              </>
            ) : (
              <span className={curr.titleAccent}>{title}</span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#66544E] max-w-lg leading-relaxed font-medium">
            {subtitle}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${curr.socialBtn} text-xs font-bold shadow-xs transition hover:scale-105`}
              >
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                <span>Instagram: {settings.instagramHandle || '@omachii18'}</span>
              </a>
            )}

            {settings?.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${curr.socialBtn} text-xs font-bold shadow-xs transition hover:scale-105`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.888 2.896 2.896 0 0 1-2.888-2.888 2.896 2.896 0 0 1 2.888-2.888c.328 0 .641.056.936.155V9.424a6.31 6.31 0 0 0-.936-.071C6.012 9.353 3.2 12.165 3.2 15.651 3.2 19.137 6.012 22 9.498 22c3.486 0 6.309-2.863 6.309-6.349V9.11a8.21 8.21 0 0 0 3.782.923v-3.347z"/>
                </svg>
                <span>TikTok: {settings.tiktokHandle || '@jiji.omachistore'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right column: Cute Polaroid Lookbook Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm space-y-3">
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-md border-4 border-white bg-white group/banner">
              <img
                key={activeImgIndex}
                src={imagesList[activeImgIndex] || '/images/charm_feed_1.jpg'}
                alt="Omachi Handmade Charm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/charm_feed_1.jpg';
                }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/banner:scale-105"
              />

              {/* Cute overlay badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-between p-3.5 pointer-events-none">
                <span className={`text-[11px] font-bold ${curr.imgBadge} px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{settings?.heroBadge || 'Ảnh thật tại tiệm 100%'}</span>
                </span>

                {imagesList.length > 1 && (
                  <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {activeImgIndex + 1} / {imagesList.length}
                  </span>
                )}
              </div>

              {/* Navigation Arrows for Slideshow */}
              {imagesList.length > 1 && (
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover/banner:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev + 1) % imagesList.length)}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Ảnh kế tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Dots indicator */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                  {imagesList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveImgIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImgIndex === dotIdx ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/60 hover:bg-white/90'
                      }`}
                      title={`Xem ảnh ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {imagesList.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/charm_feed_1.jpg';
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
