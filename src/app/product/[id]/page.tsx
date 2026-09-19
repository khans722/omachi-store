'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, ProductVariant } from '@/types';
import { formatVND, calculateSmartUnitPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { flyToCart } from '@/lib/flyToCart';
import { ShoppingBag, Star, ArrowLeft, Plus, Minus, MessageCircle, Check, AlertCircle, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, buyNow, setIsCartOpen, totalItems } = useCart();
  const { theme } = useTheme();

  const productId = params?.id as string;
  const initialFound = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
  const [product, setProduct] = useState<Product | undefined>(initialFound);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    initialFound?.variants && initialFound.variants.length > 0
      ? initialFound.variants.find((v) => (v.stock ?? 0) > 0) || initialFound.variants[0]
      : undefined
  );

  const [quantity, setQuantity] = useState<number>(initialFound?.minOrderQuantity || 1);
  const [customNote, setCustomNote] = useState('');
  const [variantError, setVariantError] = useState(false);
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  const [mainImgError, setMainImgError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(
    initialFound?.images?.[0] || ''
  );
  const hasValidMainImage = Boolean(selectedImage) && !mainImgError;
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
            if (found.minOrderQuantity && found.minOrderQuantity > 1) {
              setQuantity(found.minOrderQuantity);
            }
            if (found.variants && found.variants.length > 0) {
              setSelectedVariant((prev) => prev || found.variants.find((v: any) => (v.stock ?? 0) > 0) || found.variants[0]);
            }
            if (found.images && found.images[0]) {
              setSelectedImage(found.images[0]);
              setMainImgError(false);
            }
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

  // 1688 Auto Tier Pricing Model (Đơn vị tính: 1 chiếc/cái)
  const smartPricing = useMemo(() => {
    if (!product) {
      return { unitPrice: 0, itemsToNextTier: 0, savings: 0, discountPercent: 0 };
    }
    return calculateSmartUnitPrice(product.basePrice, quantity, product.comboTiers);
  }, [product?.basePrice, quantity, product?.comboTiers]);

  const sortedComboTiers = useMemo(() => {
    if (!product?.comboTiers || product.comboTiers.length === 0) return [];
    return [...product.comboTiers].sort((a, b) => a.minQuantity - b.minQuantity);
  }, [product?.comboTiers]);

  const unitPrice = smartPricing.unitPrice;
  const totalPrice = unitPrice * quantity;
  const totalItemCount = quantity;

  const minQty = Math.max(1, Number(product?.minOrderQuantity || 1));
  const stepQty = Math.max(1, Number(product?.stepQuantity || 1));

  const totalStockCount =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
      : product.stock || 0;

  const maxAvailable =
    selectedVariant?.stock !== undefined ? Math.max(0, selectedVariant.stock) : product.stock || 9999;

  const validateSelection = (): boolean => {
    let activeVariant = selectedVariant;
    if (product.variants && product.variants.length > 0 && !activeVariant) {
      activeVariant = product.variants.find((v) => (v.stock ?? 0) > 0) || product.variants[0];
      setSelectedVariant(activeVariant);
    }

    if (activeVariant && (activeVariant.stock ?? 0) <= 0 && (product.stock ?? 0) <= 0) {
      setWarningToast(`⚠️ Mẫu "${activeVariant.name}" hiện đã hết hàng, vui lòng chọn mẫu khác nhé!`);
      setTimeout(() => setWarningToast(null), 3000);
      return false;
    }

    if (quantity < minQty) {
      setQuantity(minQty);
    }

    if (stepQty > 1 && (quantity - minQty) % stepQty !== 0) {
      const adjusted = Math.max(minQty, Math.round((quantity - minQty) / stepQty) * stepQty + minQty);
      setQuantity(adjusted);
    }

    return true;
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!validateSelection()) return;

    // Hiệu ứng ảnh sản phẩm bay vào giỏ hàng
    const currentImg = selectedImage || selectedVariant?.image || selectedVariant?.imageUrl || product.images?.[0] || '';
    flyToCart(e?.currentTarget, currentImg);

    addItem(product, quantity, selectedVariant, customNote, undefined, false);
    setIsMobileSheetOpen(false);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    buyNow(product, quantity, selectedVariant, customNote, undefined);
    setIsMobileSheetOpen(false);
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
          <div className={`relative aspect-[4/5] rounded-3xl overflow-hidden ${curr.imageBorder} border shadow-md flex items-center justify-center bg-stone-100`}>
            {hasValidMainImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                onError={() => setMainImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                <span className="text-4xl mb-2">🌸</span>
                <span className="text-xs font-bold text-stone-500">Chưa có hình ảnh</span>
              </div>
            )}
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
                  onClick={() => {
                    setSelectedImage(img);
                    setMainImgError(false);
                  }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition flex items-center justify-center bg-stone-50 ${
                    selectedImage === img
                      ? `${curr.thumbActive} shadow-sm scale-105`
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
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

          {/* Price Tag (Theme Styled) - Clean 1688 / Shopee Standard */}
          <div className={`p-4 rounded-2xl border ${curr.priceBg} space-y-3`}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-2xl sm:text-3xl font-black ${curr.priceText}`}>{formatVND(unitPrice)}</span>
              <span className="text-xs text-gray-500 font-bold">/chiếc (cái)</span>

              {smartPricing.discountPercent > 0 ? (
                <>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                    -{smartPricing.discountPercent}%
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatVND(product.basePrice || product.originalPrice || 0)}
                  </span>
                </>
              ) : (
                product.originalPrice && product.originalPrice > unitPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )
              )}
            </div>

            {/* Bảng Thang Giá Sỉ Tĩnh Chuẩn 1688 (Rõ ràng, tinh tế, không nút bấm nhảy múa) */}
            {sortedComboTiers.length > 0 && (
              <div className="pt-2.5 border-t border-stone-200/60">
                <div className="text-[11px] text-gray-500 font-bold mb-1.5 flex items-center justify-between">
                  <span>BẢNG GIÁ SỈ THEO SỐ LƯỢNG (CHUẨN 1688):</span>
                </div>
                <div className="grid grid-flow-col auto-cols-fr gap-1.5 sm:gap-2">
                  {sortedComboTiers.map((tier, idx) => {
                    const next = sortedComboTiers[idx + 1];
                    const label = next ? `${tier.minQuantity} - ${next.minQuantity - 1} cái` : `≥ ${tier.minQuantity} cái`;
                    const isActive = next
                      ? quantity >= tier.minQuantity && quantity < next.minQuantity
                      : quantity >= tier.minQuantity;

                    const base = product?.basePrice || tier.unitPrice;
                    const disc = base > tier.unitPrice ? Math.round(((base - tier.unitPrice) / base) * 100) : 0;

                    return (
                      <div
                        key={tier.minQuantity}
                        className={`p-2 sm:p-2.5 rounded-xl text-center transition-all ${
                          isActive
                            ? 'bg-white border-2 border-stone-800 shadow-xs ring-2 ring-stone-200/80'
                            : 'bg-white/60 border border-stone-200/80'
                        }`}
                      >
                        <div className={`text-[10px] sm:text-[11px] font-semibold ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                          {label}
                        </div>
                        <div className={`text-xs sm:text-sm font-black mt-0.5 ${isActive ? curr.priceText : 'text-gray-800'}`}>
                          {formatVND(tier.unitPrice)}
                        </div>
                        {disc > 0 && (
                          <div className="text-[9px] sm:text-[10px] font-bold text-rose-500 mt-0.5">
                            -{disc}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 📱 TRÊN MOBILE: Nút Shopee "Chọn Phân Loại & Số Lượng" (Click mở Bottom Sheet Drawer) */}
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
                {selectedVariant ? selectedVariant.name : 'Chọn Màu Sắc'} • {quantity} cái
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

            {/* Desktop Quantity Stepper */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-gray-700 font-bold">Số Lượng Mua:</span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      disabled={quantity <= minQty}
                      onClick={() => setQuantity(Math.max(minQty, quantity - stepQty))}
                      className={`w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 ${curr.hoverTextColor} border-r border-gray-200 transition disabled:opacity-40`}
                      title={stepQty > 1 ? `Giảm ${stepQty} cái` : 'Giảm 1'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      step={stepQty}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setQuantity(val);
                      }}
                      onBlur={() => {
                        let finalVal = Math.max(minQty, quantity);
                        if (stepQty > 1) {
                          finalVal = Math.round(finalVal / stepQty) * stepQty;
                          if (finalVal < minQty) finalVal = minQty;
                        }
                        setQuantity(Math.min(product?.stock || 9999, finalVal));
                      }}
                      className="w-16 h-9 text-center text-sm font-black text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product?.stock || 9999, quantity + stepQty))}
                      className={`w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 ${curr.hoverTextColor} border-l border-gray-200 transition`}
                      title={stepQty > 1 ? `Tăng ${stepQty} cái` : 'Tăng 1'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-gray-700 bg-white border border-stone-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                    <span>Tổng cộng:</span>
                    <strong className={`${curr.highlightText} font-black text-sm`}>{quantity.toLocaleString('vi-VN')}</strong>
                    <span>cái</span>
                    <span className="text-gray-400">•</span>
                    <strong className="text-gray-900 font-extrabold">{formatVND(totalPrice)}</strong>
                  </div>
                </div>
              </div>

              {(minQty > 1 || stepQty > 1) && (
                <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                  ⚠️ Sản phẩm bán sỉ tối thiểu từ {minQty} cái{stepQty > 1 ? ` (bội số ${stepQty} cái/lần)` : ''}
                </p>
              )}
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
                onClick={(e) => handleAddToCart(e)}
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

          {/* Collapsible Description & Specifications */}
          <div className="pt-3 border-t border-stone-200/80">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-xs group-hover:text-stone-700">
                  Thông tin chi tiết sản phẩm
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {isDetailsOpen ? '(Thu gọn)' : '(Bấm để xem chi tiết)'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${
                  isDetailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDetailsOpen && (
              <div className="pt-3 space-y-3 text-xs text-gray-600 leading-relaxed animate-in fade-in duration-200">
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

                {product.description && (
                  <p className="pt-1 text-gray-600">{product.description}</p>
                )}
              </div>
            )}
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

        {/* Giỏ Hàng Icon - Dẫn tới trang /cart */}
        <Link
          href="/cart"
          id="product-sticky-cart-btn"
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
        </Link>

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
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0 shadow-xs flex items-center justify-center">
                {hasValidMainImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    onError={() => setMainImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-xl">🌸</span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-8 pt-0.5">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <p className={`text-xl font-black leading-tight ${curr.priceText}`}>
                    {formatVND(unitPrice)}
                    <span className="text-xs font-normal text-gray-400 ml-1">/cái</span>
                  </p>
                  {smartPricing.discountPercent > 0 && (
                    <>
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        -{smartPricing.discountPercent}%
                      </span>
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatVND(product.basePrice || product.originalPrice || 0)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Kho: <strong className="text-gray-800 font-bold">{maxAvailable.toLocaleString('vi-VN')}</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  Đã chọn:{' '}
                  <span className={`font-bold ${curr.highlightText}`}>
                    {[selectedVariant?.name, `${quantity} cái`].filter(Boolean).join(' • ')}
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
              {/* Bảng giá sỉ chuẩn 1688 trong Drawer */}
              {sortedComboTiers.length > 0 && (
                <div className="pb-2 border-b border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1.5">BẢNG GIÁ SỈ (1688):</span>
                  <div className="grid grid-flow-col auto-cols-fr gap-1.5 text-center">
                    {sortedComboTiers.map((tier, idx) => {
                      const next = sortedComboTiers[idx + 1];
                      const label = next ? `${tier.minQuantity}-${next.minQuantity - 1}c` : `≥${tier.minQuantity}c`;
                      const isActive = next
                        ? quantity >= tier.minQuantity && quantity < next.minQuantity
                        : quantity >= tier.minQuantity;
                      return (
                        <div
                          key={tier.minQuantity}
                          className={`p-1.5 rounded-lg border text-center ${
                            isActive
                              ? 'bg-white border-2 border-stone-800 font-bold shadow-2xs'
                              : 'bg-stone-50 border-stone-200 text-stone-600'
                          }`}
                        >
                          <div className="text-[9px] text-gray-500">{label}</div>
                          <div className={`text-[11px] font-black mt-0.5 ${isActive ? curr.priceText : 'text-gray-800'}`}>
                            {formatVND(tier.unitPrice)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

              {/* Group 2: Số lượng mua */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Số lượng mua:</span>
                    <span className="text-[10px] text-gray-400">
                      Tạm tính: <strong className={curr.highlightText}>{formatVND(totalPrice)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      disabled={quantity <= minQty}
                      onClick={() => setQuantity(Math.max(minQty, quantity - stepQty))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      title={stepQty > 1 ? `Giảm ${stepQty} cái` : 'Giảm 1'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      step={stepQty}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setQuantity(val);
                      }}
                      onBlur={() => {
                        let finalVal = Math.max(minQty, quantity);
                        if (stepQty > 1) {
                          finalVal = Math.round(finalVal / stepQty) * stepQty;
                          if (finalVal < minQty) finalVal = minQty;
                        }
                        setQuantity(Math.min(product?.stock || 9999, finalVal));
                      }}
                      className="w-14 h-8 text-center text-xs font-black text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product?.stock || 9999, quantity + stepQty))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      title={stepQty > 1 ? `Tăng ${stepQty} cái` : 'Tăng 1'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {(minQty > 1 || stepQty > 1) && (
                  <p className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg">
                    ⚠️ Sản phẩm bán sỉ tối thiểu từ {minQty} cái{stepQty > 1 ? ` (bội số ${stepQty} cái/lần)` : ''}
                  </p>
                )}
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
