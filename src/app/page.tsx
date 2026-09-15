'use client';

import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, CustomerFeedback, ShopSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
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

  const themeConfig = {
    green: {
      starIcon: 'text-[#78B159]',
      policyBox: 'bg-gradient-to-r from-[#F4F9EE]/70 via-[#FAFCF8]/60 to-[#FFFDF2]/60 border-[#DCEDCE]',
      policyTag: 'text-[#456F2F] bg-[#F4F9EE] border-[#DCEDCE]',
      policyCard: 'border-[#DCEDCE]',
      policyIcon: 'bg-[#F4F9EE] border-[#DCEDCE]',
      feedbackTag: 'text-[#456F2F] bg-[#F4F9EE] border-[#DCEDCE]',
      feedbackCard: 'border-[#DCEDCE]',
      feedbackAvatar: 'bg-[#F4F9EE] text-[#456F2F] border-[#DCEDCE]',
    },
    pink: {
      starIcon: 'text-[#F0789E]',
      policyBox: 'bg-gradient-to-r from-[#FFF2F6]/70 via-[#FFF8FA]/60 to-[#FFF5F8]/60 border-[#FAD1DE]',
      policyTag: 'text-[#9E2B54] bg-[#FFF2F6] border-[#FAD1DE]',
      policyCard: 'border-[#FAD1DE]',
      policyIcon: 'bg-[#FFF2F6] border-[#FAD1DE]',
      feedbackTag: 'text-[#9E2B54] bg-[#FFF2F6] border-[#FAD1DE]',
      feedbackCard: 'border-[#FAD1DE]',
      feedbackAvatar: 'bg-[#FFF2F6] text-[#9E2B54] border-[#FAD1DE]',
    },
    purple: {
      starIcon: 'text-[#9C80D8]',
      policyBox: 'bg-gradient-to-r from-[#F8F4FF]/70 via-[#FAF8FE]/60 to-[#F5F2FF]/60 border-[#E0D4FA]',
      policyTag: 'text-[#613CA8] bg-[#F8F4FF] border-[#E0D4FA]',
      policyCard: 'border-[#E0D4FA]',
      policyIcon: 'bg-[#F8F4FF] border-[#E0D4FA]',
      feedbackTag: 'text-[#613CA8] bg-[#F8F4FF] border-[#E0D4FA]',
      feedbackCard: 'border-[#E0D4FA]',
      feedbackAvatar: 'bg-[#F8F4FF] text-[#613CA8] border-[#E0D4FA]',
    },
    cream: {
      starIcon: 'text-[#E5A84B]',
      policyBox: 'bg-gradient-to-r from-[#FFF9EE]/70 via-[#FFFDF7]/60 to-[#FFF7E8]/60 border-[#F7E4BE]',
      policyTag: 'text-[#8E5A13] bg-[#FFF9EE] border-[#F7E4BE]',
      policyCard: 'border-[#F7E4BE]',
      policyIcon: 'bg-[#FFF9EE] border-[#F7E4BE]',
      feedbackTag: 'text-[#8E5A13] bg-[#FFF9EE] border-[#F7E4BE]',
      feedbackCard: 'border-[#F7E4BE]',
      feedbackAvatar: 'bg-[#FFF9EE] text-[#8E5A13] border-[#F7E4BE]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

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
              <span className={curr.starIcon}>✨</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Hiển thị {filteredProducts.length} mẫu charm &amp; vòng cườm pastel đang có sẵn
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
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6 ${curr.policyBox}`}>
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className={`text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full border ${curr.policyTag}`}>
            🎀 An Tâm Mua Sắm
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-800 pt-1">
            Chính Sách Mua Hàng &amp; Cam Kết Của Tiệm
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
            <div key={idx} className={`bg-white p-5 rounded-2xl border shadow-2xs hover:shadow-sm transition flex flex-col justify-between space-y-2.5 ${curr.policyCard}`}>
              <div className="flex items-center gap-3">
                <span className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-2xs ${curr.policyIcon}`}>
                  {policy.icon || '✨'}
                </span>
                <h3 className="text-sm font-black text-stone-800 leading-snug">
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
        <section className="space-y-6 pt-6">
          <div className="text-center space-y-1">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${curr.feedbackTag}`}>
              #OmachiFeedback 💕
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 pt-2">Khách Yêu Nói Gì Về Omachi?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className={`bg-white p-5 rounded-3xl border shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition ${curr.feedbackCard}`}>
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

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-stone-100">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${curr.feedbackAvatar}`}>
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
