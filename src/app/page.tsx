'use client';

import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS } from '@/data/products';
import { INITIAL_CATEGORIES } from '@/data/categories';
import { INITIAL_SETTINGS } from '@/data/settings';
import { Product, ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles, ShieldCheck, RefreshCw, Camera, Truck } from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<ShopSettings | null>(INITIAL_SETTINGS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, setRes, catRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()).catch(() => null),
          fetch('/api/settings').then((r) => r.json()).catch(() => null),
          fetch('/api/categories').then((r) => r.json()).catch(() => null),
        ]);

        if (prodRes && prodRes.success && prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        }
        if (setRes && setRes.success && setRes.data) {
          setSettings(setRes.data);
        }
        if (catRes && catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);

      const handleSearchEvent = (e: any) => {
        setSearchQuery(e.detail || '');
      };
      window.addEventListener('omachi-search', handleSearchEvent);
      return () => window.removeEventListener('omachi-search', handleSearchEvent);
    }
  }, []);

  const filteredProducts = products.filter((p) => {
    // 1. Lọc theo danh mục
    let matchCat = selectedCategory === 'all';
    if (!matchCat) {
      if (p.categoryId === selectedCategory || p.category === selectedCategory) {
        matchCat = true;
      } else {
        const matchedCat = categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory);
        if (matchedCat) {
          matchCat = Boolean(
            p.categoryId === matchedCat.id ||
            p.categoryId === matchedCat.slug ||
            p.category === matchedCat.id ||
            p.category === matchedCat.slug ||
            (p.categoryName && matchedCat.name && p.categoryName.trim().toLowerCase() === matchedCat.name.trim().toLowerCase())
          );
        }
      }
    }
    if (!matchCat) return false;

    // 2. Lọc theo từ khóa tìm kiếm
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return Boolean(
      p.name?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      (p.variants && p.variants.some((v: any) => v.name?.toLowerCase().includes(q)))
    );
  });

  const themeConfig = {
    green: {
      accentText: 'text-[#3A6B29]',
      tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      iconBox: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      avatarBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    pink: {
      accentText: 'text-[#9E2B54]',
      tagBg: 'bg-rose-50 text-rose-800 border-rose-200/80',
      iconBox: 'bg-rose-50 text-rose-700 border-rose-100',
      avatarBg: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    purple: {
      accentText: 'text-[#613CA8]',
      tagBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
      iconBox: 'bg-purple-50 text-purple-700 border-purple-100',
      avatarBg: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    cream: {
      accentText: 'text-[#8E5A13]',
      tagBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      iconBox: 'bg-amber-50 text-amber-700 border-amber-100',
      avatarBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  const policyIcons = [
    <ShieldCheck key="p1" className="w-5 h-5 text-emerald-600" />,
    <RefreshCw key="p2" className="w-5 h-5 text-blue-600" />,
    <Camera key="p3" className="w-5 h-5 text-rose-600" />,
    <Truck key="p4" className="w-5 h-5 text-amber-600" />,
  ];

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Hero Banner - Tự động ẩn khi tìm kiếm để hàng hóa hiển thị ngay trên đầu trang */}
      {!isSearching && (
        <HeroBanner settings={settings || undefined} />
      )}

      {/* Thanh thông báo kết quả tìm kiếm gọn gàng khi đang tìm kiếm */}
      {isSearching && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3 animate-fade-in my-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${curr.iconBox}`}>
              🔍
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">Đang tìm kiếm phụ kiện:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${curr.tagBg}`}>
                  {filteredProducts.length} sản phẩm khớp
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                &ldquo;{searchQuery}&rdquo;
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              window.dispatchEvent(new CustomEvent('omachi-search', { detail: '' }));
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition shrink-0 cursor-pointer"
            title="Xóa tìm kiếm và quay lại trang chủ"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Hiện lại giới thiệu</span>
            <span className="sm:hidden">Xóa tìm</span>
          </button>
        </div>
      )}

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Product Grid */}
      <section id="products-section" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2 font-sans">
              <span>Sản phẩm tuyển chọn tại xưởng</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {searchQuery.trim() ? (
                <span>Kết quả tìm kiếm cho <strong className={curr.accentText}>&quot;{searchQuery}&quot;</strong>: {filteredProducts.length} sản phẩm</span>
              ) : (
                <span>Hiển thị {filteredProducts.length} mẫu charm &amp; phụ kiện pastel đang có sẵn</span>
              )}
            </p>
          </div>

          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                window.dispatchEvent(new CustomEvent('omachi-search', { detail: '' }));
              }}
              className="text-xs text-stone-500 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition w-fit"
            >
              ✕ Xóa tìm kiếm
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-14 text-center space-y-3 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
            <div className="text-4xl">🔍</div>
            <h3 className="text-base font-bold text-stone-800">
              Không tìm thấy sản phẩm nào khớp với &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Thử tìm kiếm với các từ khóa ngắn hơn như: <strong>charm</strong>, <strong>kẹp tóc</strong>, <strong>vòng</strong>, <strong>hạt cườm</strong>...
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                window.dispatchEvent(new CustomEvent('omachi-search', { detail: '' }));
              }}
              className="px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Shop Purchase Policies */}
      <section className="rounded-2xl p-6 sm:p-8 bg-white border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${curr.tagBg}`}>
            An tâm mua sắm
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">
            Chính sách mua hàng &amp; Cam kết
          </h2>
          <p className="text-xs text-stone-500">
            {settings?.purchasePolicyDetail || 'Mọi đơn hàng phụ kiện handmade đều được chăm chút tỉ mỉ từ xưởng tới tay bạn.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(settings?.purchasePolicies && settings.purchasePolicies.length > 0 ? settings.purchasePolicies : [
            { icon: '📦', title: 'Đồng kiểm khi nhận hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper.' },
            { icon: '🔄', title: 'Đổi trả 1-1 trong 48 giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm mẫu.' },
            { icon: '🎀', title: '100% Ảnh thật tại xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
            { icon: '🚚', title: 'Gói hàng cẩn thận & Giao nhanh', desc: 'Đóng gói hộp xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
          ]).map((policy, idx) => (
            <div key={idx} className="bg-stone-50/70 p-5 rounded-xl border border-stone-200/70 hover:border-stone-300 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {policyIcons[idx % policyIcons.length]}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                  {policy.title}
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal pt-1">
                {policy.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
