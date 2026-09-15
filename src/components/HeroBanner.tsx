'use client';

import React, { useState, useEffect } from 'react';
import { Instagram, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const subtitle = settings?.heroSubtitle || 'Khám phá thế giới charm trong veo, kẹp hoa kem bơ và phụ kiện handmade được tuyển chọn & thiết kế thủ công tinh tế ✨';
  const slogan = settings?.slogan || 'Tiệm Phụ Kiện Thủ Công Omachi';

  const themeConfig = {
    green: {
      bg: 'bg-white/90 border-[#D8ECCE]/80 shadow-[0_10px_30px_rgba(46,90,28,0.06)]',
      tagBg: 'bg-[#F2F9EF] border-[#D8ECCE] text-[#2E5A1C]',
      titleAccent: 'text-[#2D6A24]',
      socialBorder: 'border-stone-200 hover:border-[#78B159] text-stone-700 hover:text-[#2E5A1C] bg-white',
      imgBadge: 'bg-[#2D6A24]/90 text-white',
      activeThumb: 'border-[#2D6A24]',
    },
    pink: {
      bg: 'bg-white/90 border-[#FCDCE8]/80 shadow-[0_10px_30px_rgba(219,39,119,0.06)]',
      tagBg: 'bg-[#FFF0F6] border-[#FCDCE8] text-[#9E2B54]',
      titleAccent: 'text-[#DB2777]',
      socialBorder: 'border-stone-200 hover:border-[#F472B6] text-stone-700 hover:text-[#9E2B54] bg-white',
      imgBadge: 'bg-[#DB2777]/90 text-white',
      activeThumb: 'border-[#DB2777]',
    },
    purple: {
      bg: 'bg-white/90 border-[#E8DEF8]/80 shadow-[0_10px_30px_rgba(147,51,234,0.06)]',
      tagBg: 'bg-[#F8F5FF] border-[#E8DEF8] text-[#613CA8]',
      titleAccent: 'text-[#7E22CE]',
      socialBorder: 'border-stone-200 hover:border-[#A855F7] text-stone-700 hover:text-[#613CA8] bg-white',
      imgBadge: 'bg-[#7E22CE]/90 text-white',
      activeThumb: 'border-[#7E22CE]',
    },
    cream: {
      bg: 'bg-white/90 border-[#FCEECF]/80 shadow-[0_10px_30px_rgba(217,119,6,0.06)]',
      tagBg: 'bg-[#FFFBF0] border-[#FCEECF] text-[#8E5A13]',
      titleAccent: 'text-[#B45309]',
      socialBorder: 'border-stone-200 hover:border-[#F59E0B] text-stone-700 hover:text-[#8E5A13] bg-white',
      imgBadge: 'bg-[#B45309]/90 text-white',
      activeThumb: 'border-[#B45309]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${curr.bg} border p-5 sm:p-10 my-3 sm:my-5 transition-all duration-300 backdrop-blur-xl`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
        
        {/* Left column: Text */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${curr.tagBg} border text-xs font-semibold tracking-wide shadow-2xs`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{slogan}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-stone-900 leading-[1.2] tracking-tight">
            {title.includes('&') ? (
              <>
                <span>{title.split('&')[0].trim()}</span>
                <br />
                <span className={`font-serif italic font-normal ${curr.titleAccent}`}>
                  &amp; {title.split('&')[1].trim()}
                </span>
              </>
            ) : (
              <span className={curr.titleAccent}>{title}</span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-lg leading-relaxed font-normal">
            {subtitle}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border ${curr.socialBorder} text-xs font-medium shadow-2xs transition hover:scale-102`}
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
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border ${curr.socialBorder} text-xs font-medium shadow-2xs transition hover:scale-102`}
              >
                <svg className="w-3.5 h-3.5 fill-current text-stone-800" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.888 2.896 2.896 0 0 1-2.888-2.888 2.896 2.896 0 0 1 2.888-2.888c.328 0 .641.056.936.155V9.424a6.31 6.31 0 0 0-.936-.071C6.012 9.353 3.2 12.165 3.2 15.651 3.2 19.137 6.012 22 9.498 22c3.486 0 6.309-2.863 6.309-6.349V9.11a8.21 8.21 0 0 0 3.782.923v-3.347z"/>
                </svg>
                <span>TikTok: {settings.tiktokHandle || '@jiji.omachistore'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right column: Editorial Lookbook Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-stone-200/80 bg-stone-100 group/banner">
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

              {/* Minimalist studio overlay badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end justify-between p-3.5 pointer-events-none">
                <span className={`text-[11px] font-semibold ${curr.imgBadge} backdrop-blur-md px-3 py-1 rounded-full shadow-sm`}>
                  {settings?.heroBadge || 'Ảnh thật chụp tại tiệm 100%'}
                </span>

                {imagesList.length > 1 && (
                  <span className="text-[10px] font-medium text-white/90 bg-stone-900/60 backdrop-blur-md px-2 py-0.5 rounded-full">
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
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-xs transition transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev + 1) % imagesList.length)}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-xs transition transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Ảnh kế tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Dots indicator */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                  {imagesList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveImgIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImgIndex === dotIdx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/80'
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
                    className={`relative w-11 h-9 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIndex === tIdx
                        ? `${curr.activeThumb} scale-105 shadow-xs`
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
