'use client';

import React, { useState, useEffect } from 'react';
import { Instagram, Sparkles, Heart } from 'lucide-react';
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

  // Auto-play slideshow every 4.5 seconds if multiple images exist
  useEffect(() => {
    if (imagesList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % imagesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [imagesList.length]);

  const title = settings?.heroTitle || 'Vòng Charm, Kẹp Tóc & Phụ Kiện Pastel';
  const subtitle = settings?.heroSubtitle || 'Khám phá thế giới charm trong veo, kẹp hoa kem bơ và vòng tay handmade đan thủ công theo phong cách của riêng bạn ✨';
  const slogan = settings?.slogan || 'Tiệm Charm & Phụ Kiện Xinh Omachi';

  const themeConfig = {
    green: {
      bg: 'bg-white/80 backdrop-blur-2xl border-white/90 shadow-[0_16px_40px_rgba(120,177,89,0.12)]',
      tagBg: 'bg-white/90 border-[#C8E4B6] text-[#3E6B28]',
      titleAccent: 'text-transparent bg-clip-text bg-gradient-to-r from-[#5E9B40] via-[#35BA80] to-[#E5A817]',
      socialBorder: 'border-white/90 hover:border-[#78B159] text-[#3E6B28] bg-white/80',
      imgBadge: 'bg-gradient-to-r from-[#72AA55] to-[#3DBE87]',
    },
    pink: {
      bg: 'bg-white/80 backdrop-blur-2xl border-white/90 shadow-[0_16px_40px_rgba(244,114,182,0.12)]',
      tagBg: 'bg-white/90 border-[#F5B5C8] text-[#9E2B54]',
      titleAccent: 'text-transparent bg-clip-text bg-gradient-to-r from-[#DB2777] via-[#EC4899] to-[#FB923C]',
      socialBorder: 'border-white/90 hover:border-[#F472B6] text-[#9E2B54] bg-white/80',
      imgBadge: 'bg-gradient-to-r from-[#EC4899] to-[#F472B6]',
    },
    purple: {
      bg: 'bg-white/80 backdrop-blur-2xl border-white/90 shadow-[0_16px_40px_rgba(168,85,247,0.12)]',
      tagBg: 'bg-white/90 border-[#CBB8F2] text-[#613CA8]',
      titleAccent: 'text-transparent bg-clip-text bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#6366F1]',
      socialBorder: 'border-white/90 hover:border-[#A855F7] text-[#613CA8] bg-white/80',
      imgBadge: 'bg-gradient-to-r from-[#9333EA] to-[#6366F1]',
    },
    cream: {
      bg: 'bg-white/80 backdrop-blur-2xl border-white/90 shadow-[0_16px_40px_rgba(245,158,11,0.12)]',
      tagBg: 'bg-white/90 border-[#EFCD8E] text-[#8E5A13]',
      titleAccent: 'text-transparent bg-clip-text bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#EA6C23]',
      socialBorder: 'border-white/90 hover:border-[#F59E0B] text-[#8E5A13] bg-white/80',
      imgBadge: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${curr.bg} border p-6 sm:p-10 my-4 transition-all duration-300`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Text */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${curr.tagBg} border text-xs font-bold shadow-2xs`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{slogan}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-800 leading-tight tracking-tight">
            {title.includes('&') ? (
              <>
                {title.split('&')[0].trim()}
                <br />
                <span className={curr.titleAccent}>
                  & {title.split('&')[1].trim()}
                </span> ✨
              </>
            ) : (
              <span className={curr.titleAccent}>{title} ✨</span>
            )}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-lg leading-relaxed">
            {subtitle}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border ${curr.socialBorder} text-xs font-bold shadow-2xs transition hover:scale-102 backdrop-blur-sm`}
              >
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                <span>IG: {settings.instagramHandle || '@omachii18'}</span>
              </a>
            )}

            {settings?.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border ${curr.socialBorder} text-xs font-bold shadow-2xs transition hover:scale-102 backdrop-blur-sm`}
              >
                <span className="text-xs">🎵</span>
                <span>TikTok: {settings.tiktokHandle || '@jiji.omachistore'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right column: Glass Lookbook Frame / Multi-Image Slideshow */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm space-y-2.5">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-white/50 backdrop-blur-md group/banner">
              <img
                key={activeImgIndex}
                src={imagesList[activeImgIndex] || '/images/charm_feed_1.jpg'}
                alt="Omachi Handmade Charm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/charm_feed_1.jpg';
                }}
                className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover/banner:scale-105"
              />

              {/* Gradient overlay & badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-between p-4 pointer-events-none">
                <span className={`text-xs font-bold ${curr.imgBadge} text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md`}>
                  {settings?.heroBadge || 'Ảnh thật tại tiệm 100% ✨'}
                </span>

                {imagesList.length > 1 && (
                  <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
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
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-black shadow-md backdrop-blur-xs transition transform hover:scale-110 active:scale-95"
                    title="Ảnh trước"
                  >
                    ❮
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIndex((prev) => (prev + 1) % imagesList.length)}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-black shadow-md backdrop-blur-xs transition transform hover:scale-110 active:scale-95"
                    title="Ảnh kế tiếp"
                  >
                    ❯
                  </button>
                </div>
              )}

              {/* Dots indicator */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                  {imagesList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveImgIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImgIndex === dotIdx ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      title={`Xem ảnh ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (if 3 or more images) */}
            {imagesList.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {imagesList.map((thumbUrl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => setActiveImgIndex(tIdx)}
                    className={`relative w-12 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImgIndex === tIdx
                        ? 'border-rose-500 scale-105 shadow-xs'
                        : 'border-white/80 opacity-60 hover:opacity-100'
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
