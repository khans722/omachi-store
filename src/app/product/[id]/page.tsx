'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, ProductVariant, ProductPackageOption } from '@/types';
import { formatVND } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Star, ArrowLeft, Plus, Minus, MessageCircle, Check, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, setIsCartOpen, totalItems } = useCart();
  const { theme } = useTheme();

  const productId = params?.id as string;
  const initialFound = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
  const [product, setProduct] = useState<Product | undefined>(initialFound);

  // 2 Option cố định theo yêu cầu: chỉ bán gói 10 cái và gói 100 cái, không bán lẻ
  const getPackageOptions = (prod: Product): ProductPackageOption[] => {
    if (prod.packageOptions && prod.packageOptions.length === 2) {
      return prod.packageOptions;
    }
    return [
      { id: 'pkg-10', name: '10 cái', price: prod.basePrice * 10 },
      { id: 'pkg-100', name: '100 cái', price: Math.round(prod.basePrice * 100 * 0.8) },
    ];
  };

  const initialPackages = initialFound ? getPackageOptions(initialFound) : [];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  // Mặc định chọn sẵn gói 10 cái
  const [selectedPackage, setSelectedPackage] = useState<ProductPackageOption>(
    initialPackages[0] || { id: 'pkg-10', name: '10 cái', price: (initialFound?.basePrice || 2000) * 10 }
  );

  const [variantError, setVariantError] = useState(false);
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>(
    initialFound?.images?.[0] || 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&auto=format&fit=crop&q=80'
  );
  const [isAddedToast, setIsAddedToast] = useState(false);

  // Shopee Mobile Sheet Modal State
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetAction, setMobileSheetAction] = useState<'cart' | 'buy'>('cart');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  const zaloPhone = settings?.hotline || '0339798083';
  const zaloUrl = `https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}`;

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data) {
          const found = data.data.find((p: Product) => p.id === productId || p.slug === productId);
          if (found) {
            setProduct(found);
            if (found.images && found.images[0]) {
              setSelectedImage(found.images[0]);
            }
            const pkgs = getPackageOptions(found);
            setSelectedPackage((prev) => {
              if (prev && prev.id === 'pkg-100') return pkgs[1] || pkgs[0];
              return pkgs[0];
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLatest();
  }, [productId]);

  // Bộ màu sắc nút & thành phần đồng bộ 100% theo từng Theme
  const themeConfig = {
    green: {
      categoryBadge: 'text-[#456F2F] bg-[#F4F9EE] border-[#DCEDCE]',
      breadcrumbActive: 'text-[#456F2F]',
      imageBorder: 'border-[#DCEDCE] bg-[#F4F9EE]/40',
      thumbActive: 'border-[#78B159] ring-2 ring-[#DCEDCE]',
      priceText: 'text-[#3E6B28]',
      priceBg: 'bg-[#F4F9EE] border-[#DCEDCE]',
      badgeQuyCach: 'text-[#3E6B28] bg-white border-[#DCEDCE]',
      chipActive: 'border-2 border-[#78B159] text-[#3E6B28] bg-white font-black ring-2 ring-[#DCEDCE]',
      chipInactive: 'border-stone-200 bg-white text-stone-700 hover:border-[#78B159] hover:text-[#3E6B28]',
      chipInactiveDrawer: 'border-transparent bg-stone-100 text-stone-700 active:bg-stone-200',
      triangleClass: 'border-b-[#78B159] border-r-[#78B159]',
      highlightText: 'text-[#3E6B28]',
      btnSecondary: 'border-2 border-[#78B159] bg-[#F4F9EE] hover:bg-[#EAF4E2] text-[#3E6B28]',
      btnPrimary: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] hover:from-[#629744] hover:to-[#6EA64E] text-white shadow-md shadow-[#DCEDCE]',
      stickyCartIcon: 'text-[#78B159]',
      stickyCartBadge: 'bg-[#78B159] text-white',
      focusBorder: 'focus:border-[#78B159]',
      infoCardBg: 'bg-[#F4F9EE]/50 border-[#DCEDCE]',
      hoverTextColor: 'hover:text-[#3E6B28]',
    },
    pink: {
      categoryBadge: 'text-[#9E2B54] bg-[#FFF2F6] border-[#FAD1DE]',
      breadcrumbActive: 'text-[#9E2B54]',
      imageBorder: 'border-[#FAD1DE] bg-[#FFF2F6]/40',
      thumbActive: 'border-[#F0789E] ring-2 ring-[#FAD1DE]',
      priceText: 'text-[#9E2B54]',
      priceBg: 'bg-[#FFF2F6] border-[#FAD1DE]',
      badgeQuyCach: 'text-[#9E2B54] bg-white border-[#FAD1DE]',
      chipActive: 'border-2 border-[#F0789E] text-[#9E2B54] bg-white font-black ring-2 ring-[#FAD1DE]',
      chipInactive: 'border-stone-200 bg-white text-stone-700 hover:border-[#F0789E] hover:text-[#9E2B54]',
      chipInactiveDrawer: 'border-transparent bg-stone-100 text-stone-700 active:bg-stone-200',
      triangleClass: 'border-b-[#F0789E] border-r-[#F0789E]',
      highlightText: 'text-[#9E2B54]',
      btnSecondary: 'border-2 border-[#F0789E] bg-[#FFF2F6] hover:bg-[#FFE4EE] text-[#9E2B54]',
      btnPrimary: 'bg-gradient-to-r from-[#E0688E] to-[#F0789E] hover:from-[#CF587E] hover:to-[#E0688E] text-white shadow-md shadow-[#FAD1DE]',
      stickyCartIcon: 'text-[#F0789E]',
      stickyCartBadge: 'bg-[#F0789E] text-white',
      focusBorder: 'focus:border-[#F0789E]',
      infoCardBg: 'bg-[#FFF2F6]/50 border-[#FAD1DE]',
      hoverTextColor: 'hover:text-[#9E2B54]',
    },
    purple: {
      categoryBadge: 'text-[#613CA8] bg-[#F8F4FF] border-[#E0D4FA]',
      breadcrumbActive: 'text-[#613CA8]',
      imageBorder: 'border-[#E0D4FA] bg-[#F8F4FF]/40',
      thumbActive: 'border-[#9C80D8] ring-2 ring-[#E0D4FA]',
      priceText: 'text-[#613CA8]',
      priceBg: 'bg-[#F8F4FF] border-[#E0D4FA]',
      badgeQuyCach: 'text-[#613CA8] bg-white border-[#E0D4FA]',
      chipActive: 'border-2 border-[#9C80D8] text-[#613CA8] bg-white font-black ring-2 ring-[#E0D4FA]',
      chipInactive: 'border-stone-200 bg-white text-stone-700 hover:border-[#9C80D8] hover:text-[#613CA8]',
      chipInactiveDrawer: 'border-transparent bg-stone-100 text-stone-700 active:bg-stone-200',
      triangleClass: 'border-b-[#9C80D8] border-r-[#9C80D8]',
      highlightText: 'text-[#613CA8]',
      btnSecondary: 'border-2 border-[#9C80D8] bg-[#F8F4FF] hover:bg-[#EFE8FD] text-[#613CA8]',
      btnPrimary: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] hover:from-[#7C5EB8] hover:to-[#8C6EC8] text-white shadow-md shadow-[#E0D4FA]',
      stickyCartIcon: 'text-[#9C80D8]',
      stickyCartBadge: 'bg-[#9C80D8] text-white',
      focusBorder: 'focus:border-[#9C80D8]',
      infoCardBg: 'bg-[#F8F4FF]/50 border-[#E0D4FA]',
      hoverTextColor: 'hover:text-[#613CA8]',
    },
    cream: {
      categoryBadge: 'text-[#8E5A13] bg-[#FFF9EE] border-[#F7E4BE]',
      breadcrumbActive: 'text-[#8E5A13]',
      imageBorder: 'border-[#F7E4BE] bg-[#FFF9EE]/40',
      thumbActive: 'border-[#E5A84B] ring-2 ring-[#F7E4BE]',
      priceText: 'text-[#8E5A13]',
      priceBg: 'bg-[#FFF9EE] border-[#F7E4BE]',
      badgeQuyCach: 'text-[#8E5A13] bg-white border-[#F7E4BE]',
      chipActive: 'border-2 border-[#E5A84B] text-[#8E5A13] bg-white font-black ring-2 ring-[#F7E4BE]',
      chipInactive: 'border-stone-200 bg-white text-stone-700 hover:border-[#E5A84B] hover:text-[#8E5A13]',
      chipInactiveDrawer: 'border-transparent bg-stone-100 text-stone-700 active:bg-stone-200',
      triangleClass: 'border-b-[#E5A84B] border-r-[#E5A84B]',
      highlightText: 'text-[#8E5A13]',
      btnSecondary: 'border-2 border-[#E5A84B] bg-[#FFF9EE] hover:bg-[#FEF1DA] text-[#8E5A13]',
      btnPrimary: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] hover:from-[#C7882C] hover:to-[#D6973A] text-white shadow-md shadow-[#F7E4BE]',
      stickyCartIcon: 'text-[#E5A84B]',
      stickyCartBadge: 'bg-[#E5A84B] text-white',
      focusBorder: 'focus:border-[#E5A84B]',
      infoCardBg: 'bg-[#FFF9EE]/50 border-[#F7E4BE]',
      hoverTextColor: 'hover:text-[#8E5A13]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-gray-500">Mẫu charm hoặc phụ kiện này có thể đã hết hàng hoặc đổi link.</p>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${curr.btnPrimary} text-white font-bold text-xs shadow-md`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    );
  }

  const packageOptions = getPackageOptions(product);

  // Đơn giá cho 1 gói (10 cái hoặc 100 cái)
  const unitPrice = selectedPackage?.price ?? (packageOptions[0]?.price || product.basePrice * 10);
  const totalPrice = unitPrice * quantity;

  // Tính tổng số cái thực tế
  const itemsPerPack = selectedPackage?.id === 'pkg-100' || selectedPackage?.name.includes('100') ? 100 : 10;
  const totalItemCount = quantity * itemsPerPack;

  const totalStockCount =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
      : product.stock || 0;

  const maxAvailable =
    selectedVariant?.stock !== undefined ? Math.max(0, selectedVariant.stock) : product.stock || 9999;

  const validateSelection = (): boolean => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setVariantError(true);
      setWarningToast('⚠️ Vui lòng chọn Phân loại (Màu sắc / Mẫu) trước nhé!');
      setTimeout(() => setWarningToast(null), 3000);
      return false;
    }

    if (selectedVariant && (selectedVariant.stock ?? 0) <= 0) {
      setWarningToast(`⚠️ Mẫu "${selectedVariant.name}" hiện đã hết hàng, vui lòng chọn mẫu khác nhé!`);
      setTimeout(() => setWarningToast(null), 3000);
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    addItem(product, quantity, selectedVariant, customNote, selectedPackage);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    addItem(product, quantity, selectedVariant, customNote, selectedPackage);
    router.push('/checkout');
  };

  return (
    <div className="py-3 sm:py-6 space-y-5 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* Toast feedback (Success) */}
      {isAddedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce-slow">
          <Check className="w-4 h-4" />
          <span>Đã thêm vào giỏ hàng thành công! ✨</span>
        </div>
      )}

      {/* Toast feedback (Warning / Validation) */}
      {warningToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-rose-400 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className={`hover:${curr.breadcrumbActive}`}>
          Trang chủ
        </Link>
        <span>/</span>
        <span className={`${curr.breadcrumbActive} font-semibold`}>{product.categoryName}</span>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-6 space-y-3">
          <div className={`relative aspect-[4/5] rounded-3xl overflow-hidden ${curr.imageBorder} border shadow-md`}>
            <img
              src={selectedImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/charm_feed_1.jpg';
              }}
              className="w-full h-full object-cover object-center"
            />
            {product.isHot && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                🔥 BÁN CHẠY NHẤT
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === img
                      ? `${curr.thumbActive} shadow-sm scale-105`
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
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

        {/* Right Column: Product Info & Config */}
        <div className="md:col-span-6 space-y-4 sm:space-y-5">
          <div>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${curr.categoryBadge}`}>
              {product.categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 mt-2 leading-snug">
              {product.name}
            </h1>

            {/* Rating, Sold count & Stock Badge */}
            <div className="flex items-center flex-wrap gap-2.5 mt-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-gray-800">{product.rating || 5.0}</span>
                <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount || 0})</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">
                Đã bán: <strong className="text-gray-800 font-bold">{product.soldCount}</strong>
              </span>
              <span className="text-gray-300">•</span>
              {totalStockCount > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                  <span>
                    Kho sẵn: <strong className="text-emerald-800 font-black">{totalStockCount.toLocaleString('vi-VN')}</strong> cái
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Tạm thời hết hàng</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Tag (Theme Styled) */}
          <div className={`p-4 rounded-2xl border flex items-baseline gap-3 ${curr.priceBg}`}>
            <span className={`text-2xl sm:text-3xl font-black ${curr.priceText}`}>{formatVND(unitPrice)}</span>
            <span className="text-xs text-gray-500 font-bold">/gói {selectedPackage.name}</span>
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${curr.badgeQuyCach}`}>
              Quy cách: {selectedPackage.name}
            </span>
          </div>

          {/* 📱 TRÊN MOBILE: Nút Shopee "Chọn Phân Loại / Quy Cách" (Click mở Bottom Sheet Drawer) */}
          <button
            type="button"
            onClick={() => {
              setMobileSheetAction('cart');
              setIsMobileSheetOpen(true);
            }}
            className="md:hidden w-full p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between active:bg-stone-50 transition"
          >
            <div className="flex items-center gap-2 text-xs text-left min-w-0">
              <span className="font-bold text-stone-500 shrink-0">Phân Loại:</span>
              <span className={`font-extrabold truncate ${curr.highlightText}`}>
                {selectedVariant ? selectedVariant.name : 'Chọn Màu Sắc'}, {selectedPackage.name}
              </span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${curr.highlightText}`}>
              <span>Chọn</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* 💻 TRÊN DESKTOP: Hiển thị các khối chọn Option trực tiếp ở cột bên phải */}
          <div className="hidden md:block space-y-4">
            {/* Desktop Option 1: Màu Sắc */}
            {product.variants && product.variants.length > 0 && (
              <div
                ref={variantSectionRef}
                className={`p-4 rounded-2xl transition-all ${
                  variantError
                    ? 'bg-rose-50 border-2 border-rose-500 ring-4 ring-rose-200'
                    : 'bg-stone-50/70 border border-stone-200/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-xs text-gray-500 font-bold min-w-[70px] pt-1.5">Màu Sắc:</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const vStock = v.stock ?? 0;
                        const isOutOfStock = vStock <= 0;

                        if (isOutOfStock) {
                          return (
                            <div
                              key={v.id}
                              className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-400 text-xs flex items-center gap-1.5 opacity-45 line-through select-none cursor-not-allowed"
                            >
                              {v.imageUrl && (
                                <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover grayscale opacity-50" />
                              )}
                              <span>{v.name}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedVariant(undefined);
                              } else {
                                setSelectedVariant(v);
                                setVariantError(false);
                                if (v.image || v.imageUrl) {
                                  setSelectedImage(v.image || v.imageUrl || selectedImage);
                                }
                              }
                            }}
                            className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none overflow-hidden ${
                              isSelected
                                ? curr.chipActive
                                : curr.chipInactive
                            }`}
                          >
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover shrink-0" />
                            ) : v.colorHex ? (
                              <span
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                  isSelected ? 'border-black/20' : 'border-black/10'
                                }`}
                                style={{ backgroundColor: v.colorHex }}
                              />
                            ) : null}
                            <span>{v.name}</span>

                            {isSelected && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                                <div className={`absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent ${curr.triangleClass} border-b-[12px] border-r-[12px]`} />
                                <svg
                                  className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path d="M2 6l3 3 5-5" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedVariant && (
                      <p className="text-[11px] text-gray-500 pt-0.5">
                        Đã chọn: <strong className={`${curr.highlightText} font-bold`}>{selectedVariant.name}</strong> • Còn{' '}
                        <strong className="text-emerald-700 font-bold">{selectedVariant.stock?.toLocaleString('vi-VN')}</strong> cái
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Option 2: Quy Cách (CHỈ 2 NÚT: 10 CÁI VÀ 100 CÁI) */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80">
              <div className="flex items-start gap-4">
                <span className="text-xs text-gray-500 font-bold min-w-[70px] pt-1.5">Quy Cách:</span>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2.5">
                    {packageOptions.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 select-none overflow-hidden shadow-2xs ${
                            isSelected
                              ? curr.chipActive
                              : curr.chipInactive
                          }`}
                        >
                          <span className="text-sm">{pkg.name}</span>
                          <span className={`text-[11px] font-semibold ${isSelected ? curr.highlightText : 'text-gray-400'}`}>
                            ({formatVND(pkg.price || 0)})
                          </span>

                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 overflow-hidden pointer-events-none">
                              <div className={`absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent ${curr.triangleClass} border-b-[14px] border-r-[14px]`} />
                              <svg
                                className="absolute bottom-[1px] right-[1px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-500 italic pt-1">
                    * Tiệm đóng gói chuẩn theo <strong className="text-gray-800">10 cái</strong> hoặc <strong className="text-gray-800">100 cái</strong>, không bán lẻ.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Quantity Stepper (Số lượng gói) */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs text-gray-500 font-bold min-w-[70px]">Số Lượng Gói:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 ${curr.hoverTextColor} border-r border-gray-200 transition disabled:opacity-40`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 h-8 text-center text-xs font-black text-gray-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 ${curr.hoverTextColor} border-l border-gray-200 transition`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                = Tổng cộng: <strong className={`${curr.highlightText} font-black`}>{totalItemCount.toLocaleString('vi-VN')}</strong> cái
              </span>
            </div>

            {/* Custom Note */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-bold min-w-[70px]">Ghi Chú:</span>
              <input
                type="text"
                placeholder="Lưu ý cho shop (VD: cỡ tay 15cm, đổi charm...)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none ${curr.focusBorder} text-gray-700`}
              />
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`min-w-[190px] h-12 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition transform active:scale-98 ${curr.btnSecondary}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className={`min-w-[170px] h-12 px-8 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition transform active:scale-98 ${curr.btnPrimary}`}
              >
                <span>Mua Ngay</span>
              </button>
            </div>
          </div>

          {/* Description & Specifications */}
          <div className="pt-4 border-t border-stone-200/80 space-y-3 text-xs text-gray-600 leading-relaxed">
            <h4 className="font-bold text-gray-800">Thông tin chi tiết sản phẩm:</h4>

            <div className={`grid grid-cols-2 gap-2 p-3 rounded-2xl border text-[11px] ${curr.infoCardBg}`}>
              {product.sku && (
                <div>
                  <span className="text-gray-400 block">Mã SKU:</span>
                  <strong className="font-mono text-gray-800">{product.sku}</strong>
                </div>
              )}
              {product.material && (
                <div>
                  <span className="text-gray-400 block">Chất liệu:</span>
                  <strong className="text-gray-800">{product.material}</strong>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <span className="text-gray-400 block">Kích thước:</span>
                  <strong className="text-gray-800">{product.dimensions}</strong>
                </div>
              )}
              <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                <span className="text-gray-500 block font-medium">📦 Tồn kho sẵn:</span>
                <strong className="text-emerald-700 font-extrabold text-xs">
                  {(product.stock || 0).toLocaleString('vi-VN')} sản phẩm
                </strong>
              </div>
            </div>

            <p className="pt-1">{product.description}</p>
          </div>
        </div>
      </div>

      {/* 📱 MOBILE STICKY BOTTOM ACTION BAR (THEME STYLED) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl flex items-stretch h-14">
        {/* Chat Zalo */}
        <a
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center px-3.5 text-[10px] text-gray-600 hover:text-blue-600 border-r border-gray-100 shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-blue-500 mb-0.5" />
          <span>Chat Zalo</span>
        </a>

        {/* Giỏ Hàng Icon */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`relative flex flex-col items-center justify-center px-3.5 text-[10px] text-gray-600 hover:${curr.highlightText} border-r border-gray-100 shrink-0`}
        >
          <div className="relative">
            <ShoppingBag className={`w-4 h-4 ${curr.stickyCartIcon}`} />
            {totalItems > 0 && (
              <span className={`absolute -top-1.5 -right-2 ${curr.stickyCartBadge} text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs`}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="mt-0.5">Giỏ hàng</span>
        </button>

        {/* Thêm Vào Giỏ (MỞ BOTTOM SHEET SHOPEE - THEME COLOR) */}
        <button
          type="button"
          onClick={() => {
            setMobileSheetAction('cart');
            setIsMobileSheetOpen(true);
          }}
          className={`flex-1 font-bold text-xs flex flex-col items-center justify-center transition px-2 ${curr.btnSecondary}`}
        >
          <span>Thêm Vào Giỏ</span>
        </button>

        {/* Mua Ngay (MỞ BOTTOM SHEET SHOPEE - THEME COLOR) */}
        <button
          type="button"
          onClick={() => {
            setMobileSheetAction('buy');
            setIsMobileSheetOpen(true);
          }}
          className={`flex-1 font-black text-xs flex flex-col items-center justify-center transition px-2 shadow-sm ${curr.btnPrimary}`}
        >
          <span>Mua Ngay</span>
          <span className="text-[10px] font-normal opacity-90">{formatVND(totalPrice)}</span>
        </button>
      </div>

      {/* 📱 SHOPEE MOBILE BOTTOM SHEET DRAWER (THEME STYLED) */}
      {isMobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex items-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsMobileSheetOpen(false)} />

          <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col z-10 shadow-2xl animate-slide-up pb-safe">
            {/* Header: Product Preview & Close Button */}
            <div className="p-3.5 border-b border-gray-100 flex items-start gap-3 relative">
              <div className="relative w-22 h-22 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-8 pt-0.5">
                <p className={`text-xl font-black leading-tight ${curr.priceText}`}>{formatVND(unitPrice)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Kho: <strong className="text-gray-800 font-bold">{maxAvailable.toLocaleString('vi-VN')}</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  Đã chọn:{' '}
                  <span className={`font-bold ${curr.highlightText}`}>
                    {[selectedVariant?.name, selectedPackage.name].filter(Boolean).join(' • ')}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Options in Drawer */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[55vh]">
              {/* Group 1: Màu sắc / Phân loại */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700">Màu sắc:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const vStock = v.stock ?? 0;
                      const isOutOfStock = vStock <= 0;

                      if (isOutOfStock) {
                        return (
                          <div
                            key={v.id}
                            className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-400 text-xs flex items-center gap-1.5 opacity-45 line-through select-none"
                          >
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover grayscale opacity-50" />
                            )}
                            <span>{v.name}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedVariant(undefined);
                            } else {
                              setSelectedVariant(v);
                              setVariantError(false);
                              if (v.image || v.imageUrl) setSelectedImage(v.image || v.imageUrl || selectedImage);
                            }
                          }}
                          className={`relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 select-none overflow-hidden transition ${
                            isSelected
                              ? curr.chipActive
                              : curr.chipInactiveDrawer
                          }`}
                        >
                          {v.imageUrl ? (
                            <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover shrink-0" />
                          ) : v.colorHex ? (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          ) : null}
                          <span>{v.name}</span>

                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                              <div className={`absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent ${curr.triangleClass} border-b-[12px] border-r-[12px]`} />
                              <svg
                                className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Quy cách - CHỈ 2 OPTION: 10 VÀ 100 */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700">Quy cách đóng gói:</h4>
                  <span className="text-[10px] text-gray-400">Không bán lẻ từng cái</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {packageOptions.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 select-none overflow-hidden transition ${
                          isSelected
                            ? curr.chipActive
                            : curr.chipInactiveDrawer
                        }`}
                      >
                        <span className="text-sm">{pkg.name}</span>
                        <span className={`text-[11px] font-semibold ${isSelected ? curr.highlightText : 'text-gray-400'}`}>
                          ({formatVND(pkg.price || 0)})
                        </span>

                        {isSelected && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 overflow-hidden pointer-events-none">
                            <div className={`absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent ${curr.triangleClass} border-b-[14px] border-r-[14px]`} />
                            <svg
                              className="absolute bottom-[1px] right-[1px] w-2 h-2 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Số lượng gói */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Số lượng gói:</span>
                    <span className="text-[10px] text-gray-400">
                      Tổng = <strong className={curr.highlightText}>{totalItemCount.toLocaleString('vi-VN')}</strong> cái
                    </span>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 h-8 text-center text-xs font-black text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 4: Custom Note */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block">Ghi chú custom:</label>
                <input
                  type="text"
                  placeholder="VD: Cỡ tay 15cm, đổi charm..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none ${curr.focusBorder}`}
                />
              </div>
            </div>

            {/* Footer Confirm Button (Theme Styled) */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => {
                  if (!validateSelection()) return;
                  setIsMobileSheetOpen(false);
                  if (mobileSheetAction === 'buy') {
                    handleBuyNow();
                  } else {
                    handleAddToCart();
                  }
                }}
                className={`w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 ${curr.btnPrimary}`}
              >
                {mobileSheetAction === 'buy' ? (
                  <span>Mua Ngay ({formatVND(totalPrice)})</span>
                ) : (
                  <span>Thêm Vào Giỏ Hàng ({formatVND(totalPrice)})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
