'use client';

import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, CustomerFeedback, ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles, ShieldCheck, RefreshCw, Camera, Truck, Star } from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, fbRes, setRes, catRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()).catch(() => null),
          fetch('/api/feedbacks').then((r) => r.json()).catch(() => null),
          fetch('/api/settings').then((r) => r.json()).catch(() => null),
          fetch('/api/categories').then((r) => r.json()).catch(() => null),
        ]);

        if (prodRes && prodRes.success && prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        }
        if (fbRes && fbRes.success && fbRes.data) {
          setFeedbacks(fbRes.data);
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

    const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => {
        // Direct match with categoryId, category, or slug
        if (p.categoryId === selectedCategory || p.category === selectedCategory) return true;
        
        // Find matching category definition
        const matchedCat = categories.find(
          (c) => c.id === selectedCategory || c.slug === selectedCategory
        );
        if (matchedCat) {
          if (p.categoryId === matchedCat.id || p.categoryId === matchedCat.slug) return true;
          if (p.category === matchedCat.id || p.category === matchedCat.slug) return true;
          if (
            p.categoryName &&
            matchedCat.name &&
            p.categoryName.trim().toLowerCase() === matchedCat.name.trim().toLowerCase()
          ) {
            return true;
          }
        }
        return false;
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

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <HeroBanner settings={settings || undefined} />

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2 font-sans">
              <span>Sản phẩm tuyển chọn tại xưởng</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Hiển thị {filteredProducts.length} mẫu charm &amp; phụ kiện pastel đang có sẵn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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

      {/* Customer Feedback */}
      {(settings?.showFeedbacks !== false) && feedbacks.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${curr.tagBg}`}>
              Khách hàng tin chọn
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">Đánh giá từ khách yêu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                    {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    &quot;{fb.comment}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-stone-100">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${curr.avatarBg}`}>
                    {fb.avatarText || fb.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      {fb.customerName} {fb.customerLocation ? `(${fb.customerLocation})` : ''}
                    </p>
                    {fb.purchasedProduct && (
                      <p className="text-[10px] text-stone-400">Đã mua {fb.purchasedProduct}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
