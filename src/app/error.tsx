'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Next.js Error Boundary:', error);
  }, [error]);

  const handleHardReload = () => {
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
        window.location.href = window.location.origin + '?v=' + Date.now();
      }
    } catch (_) {
      reset();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-3xl">
          🌸
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-stone-900">
            Hệ thống đang làm mới phiên bản mới!
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Trang web vừa có bản cập nhật mới. Bạn chỉ cần bấm làm mới bên dưới để tải lại dữ liệu mới nhất nhé! ✨
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleHardReload}
            className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải lại trang ngay</span>
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
