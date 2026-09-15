'use client';

import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, CustomerFeedback, ShopSettings } from '@/types';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, fbRes, setRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()).catch(() => null),
          fetch('/api/feedbacks').then((r) => r.json()).catch(() => null),
          fetch('/api/settings').then((r) => r.json()).catch(() => null),
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
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory || p.categoryId === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <HeroBanner settings={settings || undefined} />

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
              <span>Sản Phẩm Xinh Tại Xưởng</span>
              <span className="text-[#78B159]">✨</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Hiển thị {filteredProducts.length} mẫu charm & vòng cườm pastel đang có sẵn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Shop Purchase Policies */}
      <section className="bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-amber-50/60 rounded-3xl p-6 sm:p-8 border border-pink-100/80 shadow-xs space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-pink-100/80 px-3.5 py-1 rounded-full border border-pink-200">
            🎀 An Tâm Mua Sắm
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-800 pt-1">
            Chính Sách Mua Hàng & Cam Kết Của Tiệm
          </h2>
          <p className="text-xs text-stone-500">
            {settings?.purchasePolicyDetail || 'Mọi đơn hàng vòng charm và phụ kiện handmade đều được chăm chút tỉ mỉ từ xưởng tới tay bạn.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(settings?.purchasePolicies && settings.purchasePolicies.length > 0 ? settings.purchasePolicies : [
            { icon: '📦', title: 'Đồng Kiểm Khi Nhận Hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.' },
            { icon: '🔄', title: 'Đổi Trả 1-1 Trong 48 Giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.' },
            { icon: '🎀', title: '100% Ảnh Thật Tại Xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
            { icon: '🚚', title: 'Gói Quà Pastel & Giao Nhanh', desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
          ]).map((policy, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm p-4.5 rounded-2xl border border-pink-100 shadow-2xs hover:shadow-sm transition flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                  {policy.icon || '✨'}
                </span>
                <h3 className="text-xs font-black text-stone-800 leading-snug">
                  {policy.title}
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {policy.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Feedback */}
      {(settings?.showFeedbacks !== false) && feedbacks.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#5E9B3D] uppercase tracking-widest bg-[#F4F9EE] px-3 py-1 rounded-full border border-[#DCEDCE]">
              #OmachiFeedback 💕
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 pt-2">Khách Yêu Nói Gì Về Omachi?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-5 rounded-3xl border border-[#DCEDCE] shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 italic leading-relaxed">
                    &quot;{fb.comment}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#F4F9EE]">
                  <div className="w-8 h-8 rounded-full bg-[#F4F9EE] text-[#456F2F] font-bold text-xs flex items-center justify-center border border-[#DCEDCE]">
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
