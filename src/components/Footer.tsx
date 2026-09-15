'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Instagram, Sparkles, CheckCircle2, Phone } from 'lucide-react';
import OmachiLogo from '@/components/OmachiLogo';
import { ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const zaloPhone = settings?.zaloPhone || '0398445122';
  const hotline = settings?.hotline || '0398.445.122';
  const igUrl = settings?.instagramUrl || 'https://instagram.com/omachii18';
  const igHandle = settings?.instagramHandle || '@omachii18';
  const tiktokUrl = settings?.tiktokUrl || 'https://tiktok.com/@jiji.omachistore';
  const tiktokHandle = settings?.tiktokHandle || '@jiji.omachistore';
  const address = settings?.shopAddress || 'Hà Nội, Việt Nam';
  const hours = settings?.workingHours || '08:30 - 22:00 Hàng ngày';
  const slogan = settings?.slogan || 'Xưởng charm & phụ kiện handmade trong veo kẹo ngọt. Tự tay xâu từng chiếc vòng cườm, kẹp hoa kem bơ xinh xắn.';

  const themeConfig = {
    green: {
      bg: 'bg-gradient-to-b from-white via-[#F4F9EE] to-[#EAF4E2] border-[#DCEDCE]',
      badge: 'bg-[#F4F9EE] text-[#456F2F] border-[#DCEDCE]',
      hoverLink: 'hover:text-[#5E9B3D]',
      checkIcon: 'text-[#78B159]',
      cardBg: 'bg-white border-[#DCEDCE]',
      igBadge: 'from-[#FFF0F5] to-[#FFF5F7] text-[#D81B60] border-[#FAD1DE]',
    },
    pink: {
      bg: 'bg-gradient-to-b from-white via-[#FFF2F6] to-[#FFE6EE] border-[#FAD1DE]',
      badge: 'bg-[#FFF2F6] text-[#9E2B54] border-[#FAD1DE]',
      hoverLink: 'hover:text-[#E0688E]',
      checkIcon: 'text-[#F0789E]',
      cardBg: 'bg-white border-[#FAD1DE]',
      igBadge: 'from-[#FFF0F5] to-[#FFF5F7] text-[#D81B60] border-[#FAD1DE]',
    },
    purple: {
      bg: 'bg-gradient-to-b from-white via-[#F8F4FF] to-[#EFE6FD] border-[#E0D4FA]',
      badge: 'bg-[#F8F4FF] text-[#613CA8] border-[#E0D4FA]',
      hoverLink: 'hover:text-[#8C6EC8]',
      checkIcon: 'text-[#9C80D8]',
      cardBg: 'bg-white border-[#E0D4FA]',
      igBadge: 'from-[#F8F4FF] to-[#FAF7FF] text-[#613CA8] border-[#E0D4FA]',
    },
    cream: {
      bg: 'bg-gradient-to-b from-white via-[#FFF9EE] to-[#FCF0D6] border-[#F7E4BE]',
      badge: 'bg-[#FFF9EE] text-[#8E5A13] border-[#F7E4BE]',
      hoverLink: 'hover:text-[#D6973A]',
      checkIcon: 'text-[#E5A84B]',
      cardBg: 'bg-white border-[#F7E4BE]',
      igBadge: 'from-[#FFF9EE] to-[#FFFDF8] text-[#8E5A13] border-[#F7E4BE]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  return (
    <footer className={`${curr.bg} border-t pt-12 pb-8 mt-16 text-stone-600 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info & Big Logo */}
          <div className="md:col-span-1 space-y-3.5">
            <Link href="/" className="inline-block">
              <OmachiLogo size="md" />
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed">
              {slogan}
            </p>
            <div className={`flex items-center gap-2 text-xs font-bold ${curr.badge} px-3 py-1.5 rounded-full w-fit border shadow-2xs`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Ảnh Thật Tại Xưởng</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>🌸 Danh Mục Charm</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
              <li><Link href="/?cat=vong-tay" className={`${curr.hoverLink} transition`}>✨ Vòng tay charm & custom size</Link></li>
              <li><Link href="/?cat=kep-toc" className={`${curr.hoverLink} transition`}>🌸 Kẹp tóc hoa kem bơ pastel</Link></li>
              <li><Link href="/?cat=phone-charm" className={`${curr.hoverLink} transition`}>📱 Phone charm & Dây đeo thẻ</Link></li>
              <li><Link href="/?cat=beads-haul" className={`${curr.hoverLink} transition`}>💎 Hạt cườm sỉ & combo 50-200 pcs</Link></li>
              <li><Link href="/?cat=tui-mu" className={`${curr.hoverLink} transition`}>🎁 Túi mù charm may mắn</Link></li>
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>🎀 Chính Sách & Cam Kết</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
              {(settings?.purchasePolicies && settings.purchasePolicies.length > 0 ? settings.purchasePolicies : [
                { icon: '📦', title: 'Đồng kiểm hàng trước khi nhận' },
                { icon: '🔄', title: 'Đổi trả 1-1 trong 48h nếu lỗi' },
                { icon: '🎀', title: '100% Ảnh thật do tiệm tự chụp' },
                { icon: '🚚', title: 'Đóng gói quà pastel & ship nhanh' },
              ]).map((p, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-xs">{p.icon || '✓'}</span>
                  <span>{p.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>💬 Mạng Xã Hội & Hotline</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              {/* Zalo Button */}
              <a
                href={`https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl border border-blue-200 font-bold transition shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Zalo / Hotline: {hotline}</span>
              </a>

              {/* Instagram & TikTok Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-1.5 p-2 bg-gradient-to-r ${curr.igBadge} hover:scale-102 rounded-xl border font-bold transition text-[11px] shadow-2xs`}
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate">{igHandle}</span>
                </a>

                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl border border-gray-200 font-bold transition text-[11px] shadow-2xs hover:scale-102"
                >
                  <span>🎵</span>
                  <span className="truncate">{tiktokHandle}</span>
                </a>
              </div>

              {/* Address info */}
              <div className={`p-3 rounded-2xl border ${curr.cardBg} text-stone-600 space-y-0.5`}>
                <p className="font-bold text-stone-800 text-[11px]">Tiệm Omachi Handmade Studio</p>
                <p className="text-[10px] text-stone-500">📍 {address}</p>
                <p className="text-[10px] text-stone-500">⏰ {hours}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© 2026 Omachi Handmade Studio. Thiết kế với trọn vẹn yêu thương 💕</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className={`${curr.hoverLink} transition font-medium`}>Trang quản trị (Admin)</Link>
            <span>•</span>
            <Link href="/checkout" className={`${curr.hoverLink} transition font-medium`}>Tra cứu đơn hàng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
