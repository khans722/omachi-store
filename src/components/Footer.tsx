'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Instagram, Sparkles, MapPin, Clock, ShieldCheck, RefreshCw, Camera, Truck, ChevronRight } from 'lucide-react';
import OmachiLogo from '@/components/OmachiLogo';
import { ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('omachi_shop_settings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }
    } catch (e) {}

    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          try {
            localStorage.setItem('omachi_shop_settings', JSON.stringify(res.data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const zaloPhone = settings?.zaloPhone || settings?.hotline || '';
  const hotline = settings?.hotline || settings?.zaloPhone || '';
  const igUrl = settings?.instagramUrl || 'https://instagram.com/omachii18';
  const igHandle = settings?.instagramHandle || '@omachii18';
  const tiktokUrl = settings?.tiktokUrl || 'https://tiktok.com/@jiji.omachistore';
  const tiktokHandle = settings?.tiktokHandle || '@jiji.omachistore';
  const address = settings?.shopAddress || 'Hà Nội, Việt Nam';
  const hours = settings?.workingHours || '08:30 - 22:00 Hàng ngày';
  const slogan = settings?.slogan || 'Xưởng charm & phụ kiện handmade trong veo kẹo ngọt. Tự tay xâu từng chiếc vòng cườm, kẹp hoa kem bơ xinh xắn.';

  const themeConfig = {
    green: {
      badge: 'bg-[#F2F9EF] text-[#2E5A1C] border-[#D8ECCE]',
      hoverLink: 'hover:text-[#2E5A1C]',
    },
    pink: {
      badge: 'bg-[#FFF0F6] text-[#9E2B54] border-[#FCDCE8]',
      hoverLink: 'hover:text-[#9E2B54]',
    },
    purple: {
      badge: 'bg-[#F8F5FF] text-[#613CA8] border-[#E8DEF8]',
      hoverLink: 'hover:text-[#613CA8]',
    },
    cream: {
      badge: 'bg-[#FFFBF0] text-[#8E5A13] border-[#FCEECF]',
      hoverLink: 'hover:text-[#8E5A13]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <footer className="bg-stone-50/90 border-t border-stone-200 pt-12 pb-8 mt-16 text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-3.5">
            <Link href="/" className="inline-block">
              <OmachiLogo size="md" />
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed">
              {slogan}
            </p>
            <div className={`flex items-center gap-2 text-xs font-semibold ${curr.badge} px-3 py-1.5 rounded-full w-fit border`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Ảnh Thật Tại Xưởng</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Danh Mục Sản Phẩm
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
              <li>
                <Link href="/?cat=vong-tay" className={`${curr.hoverLink} transition inline-flex items-center gap-1.5`}>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span>Vòng tay charm &amp; Custom size</span>
                </Link>
              </li>
              <li>
                <Link href="/?cat=kep-toc" className={`${curr.hoverLink} transition inline-flex items-center gap-1.5`}>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span>Kẹp tóc hoa kem bơ pastel</span>
                </Link>
              </li>
              <li>
                <Link href="/?cat=phone-charm" className={`${curr.hoverLink} transition inline-flex items-center gap-1.5`}>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span>Phone charm &amp; Dây đeo thẻ</span>
                </Link>
              </li>
              <li>
                <Link href="/?cat=beads-haul" className={`${curr.hoverLink} transition inline-flex items-center gap-1.5`}>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span>Hạt cườm sỉ &amp; Combo charm</span>
                </Link>
              </li>
              <li>
                <Link href="/?cat=tui-mu" className={`${curr.hoverLink} transition inline-flex items-center gap-1.5`}>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span>Túi mù charm may mắn</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Cam Kết Dịch Vụ
            </h4>
            <ul className="space-y-3 text-xs text-stone-600 font-normal">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đồng kiểm hàng trước khi nhận</span>
              </li>
              <li className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đổi trả 1-1 trong 48h nếu lỗi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% ảnh thật chụp tại tiệm</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đóng gói cẩn thận &amp; giao nhanh toàn quốc</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Liên Hệ &amp; Hỗ Trợ
            </h4>
            <div className="space-y-2.5 text-xs">
              {/* Zalo Button */}
              <a
                href={settings?.zaloOfficialUrl || (zaloPhone ? `https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}` : 'https://zalo.me')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl border border-stone-200 font-medium transition shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Zalo tư vấn: {hotline || zaloPhone || 'Omachi'}</span>
              </a>

              {/* Instagram & TikTok Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 font-medium transition text-[11px] text-stone-700 hover:text-stone-900"
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate">{igHandle}</span>
                </a>

                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-xl border border-stone-200 font-medium transition text-[11px]"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.888 2.896 2.896 0 0 1-2.888-2.888 2.896 2.896 0 0 1 2.888-2.888c.328 0 .641.056.936.155V9.424a6.31 6.31 0 0 0-.936-.071C6.012 9.353 3.2 12.165 3.2 15.651 3.2 19.137 6.012 22 9.498 22c3.486 0 6.309-2.863 6.309-6.349V9.11a8.21 8.21 0 0 0 3.782.923v-3.347z"/>
                  </svg>
                  <span className="truncate">{tiktokHandle}</span>
                </a>
              </div>

              {/* Address info */}
              <div className="p-3 rounded-xl border border-stone-200 bg-white text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800 text-[11px]">Tiệm Omachi Handmade Studio</p>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                  <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{hours}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© 2026 Omachi Handmade Studio. Tinh tế &amp; Tận tâm.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className={`${curr.hoverLink} transition font-medium text-stone-500`}>Trang quản trị (Admin)</Link>
            <span>•</span>
            <Link href="/tra-cuu-don-hang" className={`${curr.hoverLink} transition font-medium text-stone-500`}>Tra cứu đơn hàng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
